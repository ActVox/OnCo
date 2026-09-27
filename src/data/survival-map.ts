/**
 * Which SEER Cancer Stat Facts site stands for each OnCo cancer. SEER reports by anatomical site, so several
 * OnCo cancers share one site; `shared` says so in plain words and the page repeats it. Cancers with no
 * SEER fact sheet (mesothelioma, neuroendocrine tumours, most paediatric and rare cancers) are absent here
 * and listed as gaps on /survival/. Fact sheets: https://seer.cancer.gov/statfacts/
 */
export type SurvivalSite = { slug: string; seerLabel: string; shared?: string };

export const SURVIVAL_SITES: Record<string, SurvivalSite> = {
  tnbc: { slug: "breast", seerLabel: "Breast (female)", shared: "SEER reports all female breast cancer together, not by subtype; triple-negative disease has worse survival than this average." },
  "breast-hr-positive": { slug: "breast", seerLabel: "Breast (female)", shared: "SEER reports all female breast cancer together, not by subtype; HR-positive disease has better survival than this average." },
  "breast-her2-positive": { slug: "breast", seerLabel: "Breast (female)", shared: "SEER reports all female breast cancer together, not by subtype." },
  nsclc: { slug: "lungb", seerLabel: "Lung and bronchus", shared: "SEER reports all lung cancer together; non-small-cell disease has better survival than this average." },
  sclc: { slug: "lungb", seerLabel: "Lung and bronchus", shared: "SEER reports all lung cancer together; small-cell disease has worse survival than this average." },
  colorectal: { slug: "colorect", seerLabel: "Colon and rectum" },
  pancreatic: { slug: "pancreas", seerLabel: "Pancreas" },
  gastric: { slug: "stomach", seerLabel: "Stomach", shared: "Gastro-oesophageal junction tumours are split between the stomach and oesophagus sites in SEER." },
  esophageal: { slug: "esoph", seerLabel: "Oesophagus" },
  hcc: { slug: "livibd", seerLabel: "Liver and intrahepatic bile duct", shared: "SEER combines hepatocellular carcinoma with intrahepatic bile duct cancer." },
  cholangiocarcinoma: { slug: "livibd", seerLabel: "Liver and intrahepatic bile duct", shared: "SEER combines intrahepatic bile duct cancer with liver cancer; extrahepatic and gallbladder cancers are not included." },
  prostate: { slug: "prost", seerLabel: "Prostate" },
  urothelial: { slug: "urinb", seerLabel: "Urinary bladder", shared: "Upper-tract urothelial cancers are not included in the bladder site." },
  rcc: { slug: "kidrp", seerLabel: "Kidney and renal pelvis" },
  ovarian: { slug: "ovary", seerLabel: "Ovary" },
  endometrial: { slug: "corp", seerLabel: "Uterus (corpus and uterus, NOS)" },
  cervical: { slug: "cervix", seerLabel: "Cervix uteri" },
  melanoma: { slug: "melan", seerLabel: "Melanoma of the skin" },
  // The house form in this file is "worse survival than this average" / "better survival than this average", said
  // without an intensifier and without a figure, because the cancer's own record carries the figures with their
  // cohorts. Glioblastoma read "far below this average", which is the same claim with a thumb on the scale.
  glioblastoma: { slug: "brain", seerLabel: "Brain and other nervous system", shared: "SEER combines all brain and nervous system tumours; glioblastoma has worse survival than this average." },
  "head-and-neck": { slug: "oralcav", seerLabel: "Oral cavity and pharynx", shared: "Covers oral cavity and pharynx only; larynx is a separate SEER site." },
  sarcoma: { slug: "soft", seerLabel: "Soft tissue including heart", shared: "Soft-tissue sarcomas only; bone sarcomas and GIST are reported separately." },
  thyroid: { slug: "thyro", seerLabel: "Thyroid" },
  aml: { slug: "amyl", seerLabel: "Acute myeloid leukaemia" },
  "all-leukemia": { slug: "alyl", seerLabel: "Acute lymphocytic leukaemia" },
  cll: { slug: "clyl", seerLabel: "Chronic lymphocytic leukaemia" },
  cml: { slug: "cmyl", seerLabel: "Chronic myeloid leukaemia" },
  dlbcl: { slug: "dlbcl", seerLabel: "Diffuse large B-cell lymphoma" },
  "follicular-lymphoma": { slug: "follicular", seerLabel: "Follicular lymphoma" },
  "hodgkin-lymphoma": { slug: "hodg", seerLabel: "Hodgkin lymphoma" },
  "multiple-myeloma": { slug: "mulmy", seerLabel: "Myeloma" },
  testicular: { slug: "testis", seerLabel: "Testis" },
  anal: { slug: "anus", seerLabel: "Anus, anal canal and anorectum" },
  vulvar: { slug: "vulva", seerLabel: "Vulva" },
  osteosarcoma: { slug: "bones", seerLabel: "Bone and joint", shared: "SEER combines all bone and joint cancers." },
  "ewing-sarcoma": { slug: "bones", seerLabel: "Bone and joint", shared: "SEER combines all bone and joint cancers." },
  gist: { slug: "smint", seerLabel: "Small intestine", shared: "GIST is not a SEER site; small-intestine cancer is the closest published table and is not a substitute." },
};

/** International sources the page points to. No numbers are copied from them; they are cited for readers who need non-US figures. */
export const INTERNATIONAL_SOURCES = [
  { label: "CONCORD-3: global surveillance of trends in cancer survival 2000-14 (Lancet, 2018)", url: "https://doi.org/10.1016/S0140-6736(17)33326-3", note: "Five-year net survival for 18 cancers in 71 countries, from 322 population-based registries." },
  { label: "EUROCARE-6", url: "https://www.eurocare.it/", note: "Survival of cancer patients in Europe, by country and cancer, from population-based registries." },
  { label: "Cancer Research UK survival statistics", url: "https://www.cancerresearchuk.org/health-professional/cancer-statistics/survival", note: "England-focused survival by cancer type and stage where available." },
  { label: "Office for National Statistics: cancer survival in England", url: "https://www.ons.gov.uk/peoplepopulationandcommunity/healthandsocialcare/conditionsanddiseases", note: "Age-standardised net survival by stage, published with NHS Digital." },
];
