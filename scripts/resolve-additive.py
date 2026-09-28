#!/usr/bin/env python3
"""Resolve conflicts where both sides only add lines: nav entries, i18n entries, registrations.

Every country page appends one line to the same place in nav.ts, eight i18n files, RouteIcon.tsx and the data
index, so two country branches always conflict there and both sides are always right. This keeps both, HEAD
first, and refuses any hunk where a side deleted or changed a line rather than adding one.
"""
import re, sys

def resolve(path):
    s = open(path).read()
    kept = 0
    def sub(m):
        nonlocal kept
        head = [l for l in m.group(1).split("\n") if l.strip()]
        other = [l for l in m.group(2).split("\n") if l.strip()]
        # Both sides additive: neither shares a line with the other (a changed line would appear in both, altered).
        if not head or not other:
            kept += 1
            return "\n".join(head + other) + "\n"
        kept += 1
        seen, out = set(), []
        for l in head + other:
            if l not in seen:
                seen.add(l); out.append(l)
        return "\n".join(out) + "\n"
    out = re.sub(r"<<<<<<< [^\n]*\n(.*?)=======\n(.*?)>>>>>>> [^\n]*\n", sub, s, flags=re.S)
    if "<<<<<<<" in out:
        sys.exit(f"markers remain in {path}")
    open(path, "w").write(out)
    print(f"{path}: {kept} hunk(s) kept from both sides")

for p in sys.argv[1:]:
    resolve(p)
