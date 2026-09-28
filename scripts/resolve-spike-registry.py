#!/usr/bin/env python3
"""Resolve the two registry conflicts that every spike merge produces.

scripts/spike-sources.ts and src/data/spikes/index.ts each hold an import block and one long
single-line collection. Parallel spike agents always append to both, so git always conflicts there.
Both sides are additive, so the resolution is a union: keep HEAD's order, append what the incoming
branch added. Nothing is ever dropped. An earlier hand-rolled version dropped a whole agent's
entries and only scripts/audit.test.ts caught it, so this prints what it added and refuses any
conflict line it does not recognise.
"""
import re
import sys

PAIR = re.compile(r'"[^"]+":\s*\w+')


def array_open(line):
    # `const spikes: Spike[] = [a, b]` — the first "[" belongs to the type, so anchor on the "= [".
    return line.index("= [") + 2 if "= [" in line else line.index("[")


def union_array(head, other):
    i, j = array_open(head), head.rindex("]")
    hp = [p.strip() for p in head[i + 1:j].split(",") if p.strip()]
    op = [p.strip() for p in other[array_open(other) + 1:other.rindex("]")].split(",") if p.strip()]
    added = [p for p in op if p not in hp]
    return head[:i + 1] + ", ".join(hp + added) + head[j:], added


def union_pairs(head, other):
    hp, op = PAIR.findall(head), PAIR.findall(other)
    if not hp:
        raise SystemExit(f"unrecognised conflict line, resolve by hand: {head[:120]}")
    added = [p for p in op if p not in hp]
    line = head.rstrip()
    if not line.endswith(","):
        line += ","
    if added:
        line += " " + ", ".join(added) + ","
    return line, added


def resolve(path):
    added_all = []

    def sub(m):
        hl = [l for l in m.group(1).rstrip("\n").split("\n")]
        ol = [l for l in m.group(2).rstrip("\n").split("\n")]
        # Imports and the collection line are independent: an agent may add one, two or three
        # import lines beside its single collection entry, so pairing the two sides line by line
        # drifts and can emit the collection twice. Split each side by shape instead.
        out, seen = [], set()
        for l in [l for l in hl if l.startswith("import")] + [l for l in ol if l.startswith("import")]:
            if l not in seen:
                seen.add(l)
                out.append(l)
        h_rest = [l for l in hl if not l.startswith("import")]
        o_rest = [l for l in ol if not l.startswith("import")]
        for i in range(max(len(h_rest), len(o_rest))):
            h = h_rest[i] if i < len(h_rest) else ""
            o = o_rest[i] if i < len(o_rest) else ""
            if h == o or not o:
                out.append(h)
                continue
            if not h:
                out.append(o)
                continue
            if "[" in h and "]" in h and "]" in o:
                line, added = union_array(h, o)
                added_all.extend(added)
                out.append(line)
            elif "[" in h and "]" in h:
                # The incoming side broke the collection over several lines to add a comment beside its entries.
                # Keep HEAD's line, drop its closing bracket, and append the incoming tail with anything HEAD
                # already lists removed, so the comment survives and nothing is listed twice.
                have = set(re.findall(r'"[^"]+"', h))
                tail = []
                for extra in o_rest[i + 1:]:
                    kept = [e for e in re.findall(r'"[^"]+"', extra) if e not in have]
                    if extra.strip().startswith("//"):
                        tail.append(extra)
                    elif kept:
                        tail.append("  " + ", ".join(kept) + ",")
                        added_all.extend(kept)
                if not tail:
                    out.append(h); break
                tail[-1] = tail[-1].rstrip(",") + "];"
                out.append(h.rstrip().rstrip(";").rstrip("]").rstrip().rstrip(",") + ",")
                out.extend(tail)
                break
            else:
                line, added = union_pairs(h, o)
                added_all.extend(added)
                out.append(line)
        return "\n".join(out) + "\n"

    src = open(path).read()
    out = re.sub(r"<<<<<<< [^\n]*\n(.*?)=======\n(.*?)>>>>>>> [^\n]*\n", sub, src, flags=re.S)
    if "<<<<<<<" in out:
        sys.exit(f"markers remain in {path}")
    open(path, "w").write(out)
    print(f"{path}: added {len(added_all)} -> {', '.join(added_all) or 'nothing (imports only)'}")


for p in sys.argv[1:]:
    resolve(p)
