# SIH 2026: FDR + APAAR Context File

**Prepared:** 27 October 2026 (updated after the Grok and ChatGPT research rounds; headline idea decided: enrolment ledger)
**Submission deadline:** 28 October 2026
**Organisation / bureau:** AICTE, Regulation Bureau
**Theme / category:** Smart Automation, Software

---

## 1. Where we stand

The team may submit a maximum of **2 problem statements**. Final decision:

| Slot | PS number | Title | Owner | Status |
|---|---|---|---|---|
| 1 | **SIH26265** | Streamline of security deposit / FDR portal | Ravi Jaiswal | Draft deck exists (`FDR_Setu_SIH26265_Draft.pptx`) |
| 2 | **SIH26263** | APAAR ID-based student data management and verification platform for AICTE-approved institutions | Iron (Ravi Raj Pandey) | Headline idea decided: **enrolment ledger**. MVP scope still to be confirmed; deck not yet written |

**Dropped, and why**

- **SIH26261** (AI document validation and authentication): needs OCR tuning, forgery detection and computer vision across many document types. Nobody on the team has OCR or CV experience, so the team could not defend it if shortlisted. Ravi unlocked it himself after discussion.
- **SIH26262** (approval workflow automation) and **SIH26264** (complaint dashboard): both are generic "case moving through stages with SLAs and a dashboard" ideas, expected to be crowded and to look alike. They also overlap with each other.

**Selection criteria the team used:** genuine government need, distinct ideas that do not read as one product split in half, and what the team can credibly describe, mock honestly and build if shortlisted. Statement difficulty on its own was not treated as an advantage.

**Working style:** Ravi is the main heavy builder. Most coding will be assisted by Cursor and Codex. Scope must stay small enough that Ravi is not a single point of failure.

**Idea counts seen so far (from the team's file, now stale, so recheck on the portal):**
SIH26265: 15, SIH26263: 21, SIH26262: 23, SIH26261: 25, SIH26264: 31 (out of 500).

---

## 2. The two problem statements in brief

### SIH26265: Security deposit / FDR portal
Institutions may have to submit or maintain security deposits or Fixed Deposit Receipts with AICTE. Records are scattered and managed manually, so it is hard to know the current state of any deposit. The statement asks for a centralised portal covering:

1. Institution-wise and instrument-wise repository (reference numbers, bank, amount, issue and maturity dates, status)
2. Digital document management
3. Verification and discrepancy detection (including bank verification where available)
4. Automated validity and maturity tracking
5. Renewal and replacement monitoring
6. Release and refund workflow
7. Automated alerts and escalation
8. Dashboards and management reports
9. Audit trail and access control
10. System integration and data security

### SIH26263: APAAR ID-based student data platform
AICTE only collects detailed student-level data from PGDM institutions. Other approved institutions report aggregate numbers such as total enrolment. As a result AICTE cannot verify who is enrolled, cannot easily detect admissions above approved intake, and cannot catch one student enrolled in multiple institutions. The statement asks for a platform using APAAR ID as the unique key, with these requirements:

1. Secure platform/API for institutions to upload student-level data using APAAR ID
2. Data fields: approved intake, actual enrolment, supernumerary seats, NRI category, OCI status, Foreign National status, and others
3. Automated validation: duplicates, invalid or missing APAAR IDs, admissions above approved intake, inconsistencies, duplicate enrolment across institutions
4. Dashboards for AICTE and institutions
5. Secure verification mechanism for AICTE, institutions, employers and other regulators
6. Verifiable student records linked to academic identity
7. Integration/API capability
8. Data security, privacy, authentication, RBAC, audit trails, consent
9. Reports for policy, accreditation and monitoring
10. Printing/display of APAAR ID with student ID on certificates

Solution flow given in the statement: Institution → Student data upload → APAAR validation → Data verification → AICTE central repository → Analytics and monitoring → Authorised verification.

---

## 3. The FDR deck we got from Ravi: `FDR_Setu_SIH26265_Draft.pptx`

The deck is built on the SIH 2026 idea-presentation template (a public GitHub mirror; Ravi's own speaker notes say to verify its currency with the SPOC before submission). It has **6 slides**:

| Slide | Title | What it contains |
|---|---|---|
| 1 | Title | "FDR SETU", PS ID, PS title, theme, category. Team ID and team name still "to be added" |
| 2 | Proposed Solution | One case file tracks submission, maturity, renewal and release. Includes an illustrative replacement-FDR case (Version 1, Version 2, Review) and the "Innovation and uniqueness" box |
| 3 | Technical Approach | Flow: institution submission → extract fields and review → rules evaluate current evidence → versioned record and audit history → authorised decision. Stack: React with TypeScript, Python with FastAPI, PostgreSQL, protected document storage, OCR, scheduled reminder worker |
| 4 | Feasibility and Viability | Risk and mitigation table (bank verification access, OCR mistakes, changed evidence or rules, unauthorised or conflicting actions) plus a pilot proposal |
| 5 | Impact and Benefits | Audience / intended benefit / how we will measure it table; economic, governance and environmental benefits; evaluation plan using synthetic cases |
| 6 | Research and References | PS, APH 2024-27 Clause 6.46, 2026-27 addendum, existing systems (MP PWD, Mahim Soft, NeSL), reference deck collection |

**The core idea of FDR Setu:** evidence-linked case management. When an FDR is replaced, only the checks affected by the changed details reopen. Earlier evidence and decisions stay in the history. Ravi describes it as an application-specific engineering contribution, not a globally unprecedented invention.

**Conventions Ravi's deck follows (the APAAR deck should match):**

- Every slide has speaker notes that carry caveats and a dated list of sources
- Honest language throughout: "proposed", "synthetic records", "no claim of an existing AICTE or bank deployment", "no performance result is asserted"
- Mocked or unavailable integrations are labelled openly (for example, the bank connector is simulated)
- A human official keeps the final decision
- Benefits are described as intended outcomes, with an evaluation plan, not measured results

**Open items in the FDR deck itself (Ravi's own notes):** team ID and team name are pending; the 2026-27 addendum wording on Clause 6.46 needs reconciling with the current original, which Ravi could not access; the template's currency should be confirmed with the SPOC.

---

## 4. What we are suggesting for APAAR (SIH26263)

### 4.1 Format
Build the APAAR deck from the **same SIH template** so the two submissions look like a matched pair. Use the same 6-slide structure and the same speaker-notes convention as Ravi's deck.

### 4.2 Proposed headline idea: an "enrolment ledger"
Instead of "upload a CSV and show a dashboard", every seat an institution claims is checked three ways:

1. Against its **approved intake** and seat-category limits (supernumerary, NRI, OCI, Foreign National)
2. Against **other institutions**, to catch the same APAAR ID enrolled in two places
3. Against **consent**, so employers and regulators get only a minimal answer (for example "enrolled at X, program Y, verified") and never a full record

**Distinguishing design choice:** uncertain matches go to a **human review queue with a confidence score**. No student is auto-rejected on a fuzzy match. This mirrors the evidence-and-review framing in Ravi's deck.

*Status: **DECIDED (27 October 2026): lead with the enrolment ledger.***

**Why the ledger leads**
- AICTE itself posted this problem statement from the regulator's side. Its core asks are validation of duplicates, over-intake and cross-institution enrolment, plus AICTE dashboards and reports. The ledger answers these directly.
- It closes AICTE's real blind spot: institutions report course-wise totals, and AICTE cannot verify who is enrolled, spot over-intake by category, or catch one student in two places.
- It is harder to copy than a generic QR verification flow, and it matches the evidence-and-review framing of Ravi's FDR deck, so the two submissions read as a pair.

**Role of consent-scoped verification:** it stays in the plan as the **output layer**, not the headline. The ledger decides whether a seat claim holds up; verified records are then released to employers and other regulators as a minimal, consent-checked answer (for example "enrolled at X, program Y, verified"). This covers the PS requirements on verification, verifiable records and consent.

**Headline wording for slide 2:** "Every seat claimed is checked three ways: against approved intake, against other institutions, and against student consent."
**Supporting line:** "Uncertain matches go to a human reviewer with a confidence score. No student is auto-rejected."

### 4.3 Proposed MVP scope

**Must-have**

1. Upload with template and staged validation (structural checks, APAAR ID checks, within-submission checks)
2. Mock APAAR verification adapter (pluggable, so a real integration could replace it)
3. Over-intake detection and duplicate detection, including cross-institution
4. AICTE dashboard and institution dashboard (6 to 8 widgets total)
5. Role-based access and audit log
6. Reason-coded error reports (each outcome has a reason code, a plain-language message and a suggested fix)
7. **No-APAAR fallback path** (proposed after research, pending team confirmation): not every student will have an ID yet (incomplete rollout; opt-out unverified), so students without an ID are recorded with a flagged status and matched on name + DOB + a secondary attribute, with a confidence score and a human review queue. Never auto-reject on a fuzzy match.

**Should-have:** seat-category limits held in a configurable rules table, not hard-coded (limits may differ between APH versions); consent ledger with minimal-disclosure verification for employers; signed verifiable record with QR.

**Stretch / planned:** report export; certificate print specification. (Fuzzy matching moved up to must-have item 7 above.)

**Roadmap only (document, do not build):** real APAAR/DigiLocker integration, formal DPDP compliance review, mobile app, multi-language UI.

### 4.4 Validation engine layers

| Layer | Checks |
|---|---|
| A. Structural | Required columns, types, dates, row-level formats |
| B. APAAR ID | Missing ID, invalid format, not found or inactive in the mock registry, identity mismatch |
| C. Within-submission | Duplicate ID in the same file, enrolment above approved intake, category counts above limits, inconsistent category flags |
| D. Cross-institution | Same ID enrolled elsewhere in the same academic year, overlapping enrolment periods |
| E. Fuzzy duplicates (stretch) | Name + DOB + secondary attribute similarity, with score and human review |

### 4.5 Privacy and security design (the part evaluators are likely to probe)

- Data minimisation: no marks, no Aadhaar numbers
- Consent ledger: what, when, which purpose, revocation status; handling of minors and guardian consent to be stated
- Role-based access: AICTE officials see aggregates by default and record-level data only with a reason; institution admins see their own students only; employers and other regulators get yes/no or limited fields with consent
- Encryption in transit and at rest; field-level protection for sensitive attributes
- Immutable audit log of uploads, views and verifications
- Stated retention and deletion policy
- Principle-level alignment with India's DPDP Act. **Do not claim formal compliance.**

### 4.6 What is real vs mocked

| Component | Prototype | Production path |
|---|---|---|
| APAAR registry lookup | Mock service with synthetic data | Official APAAR / DigiLocker integration |
| Student data | Synthetic dataset | Institution submissions |
| Digital signature | Platform-generated key pair | HSM-backed signing |
| Notifications | Simulated | SMS / email gateways |

### 4.7 Proposed stack
Python (FastAPI), PostgreSQL, React front end, Chart.js or Recharts, Docker Compose for a clean demo. This is consistent with Ravi's FDR stack.

### 4.8 Proposed slide plan

| Slide | Content |
|---|---|
| 1 | Title page, PS details, team fields |
| 2 | Proposed solution: the ledger idea, one worked example (a student flagged as double-enrolled), the distinction |
| 3 | Technical approach: flow, validation stages, mock adapter, repository, verification; stack |
| 4 | Feasibility: risk and mitigation table (APAAR access mocked, name/DOB mismatches, privacy, over-scope) and a pilot proposal |
| 5 | Impact: audience / benefit / how measured, using synthetic cases only |
| 6 | References: the PS, APAAR and DPDP sources, prior systems, a "no claims" line |

### 4.9 Demo flow (3 to 4 minutes)

1. Institution uploads a student file with planted errors
2. Report shows an invalid ID, a duplicate, an over-intake course and a cross-institution double enrolment, each with a reason code
3. Institution fixes and resubmits; records are accepted
4. AICTE dashboard updates (intake vs enrolment, flagged institution)
5. An employer requests verification; consent is checked; a minimal verified response returns via QR
6. The audit log shows the whole trail

### 4.10 Go / no-go questions for the team

- Who owns the validation engine and data model?
- Who owns security, consent and RBAC?
- Is the team willing to cut stretch items without guilt?
- Is the team comfortable building against a mock and saying so openly?

---

## 5. Facts that must be verified before they go on a slide

*Status: Grok rounds 1 to 5 (sections 7, 8.1, 8.2) answered several of these; the list of what is still open is at the end of section 8.2. In short: APAAR is 12 digits (official FAQ, per Grok), minors need parental consent, DPDP Section 17(1)(b) and Rules timing are in 8.2, and APH clause numbers remain unverified against the official PDF.*

These come from the problem statement and general knowledge, **not** from checked official sources:

- The exact **APAAR ID format** (believed to be a 12-digit number, unconfirmed)
- Whether any API or bulk verification exists for institutions or regulators
- Consent rules for students under 18
- Whether AICTE may legitimately receive student-level data from non-PGDM institutions
- Exact **APH 2024-27 limits and clause numbers** for supernumerary, NRI, OCI, PIO and FN seats, and any 2026-27 addendum changes
- **DPDP Act 2023 / DPDP Rules** wording, and what is final law versus draft
- Current idea counts on the portal

The research prompt in section 6 is designed to collect these.

---

## 6. Research prompt for Grok

Paste this into Grok. Results should be brought back for checking before anything goes into the deck.

```
I'm preparing an idea-submission deck for Smart India Hackathon 2026, problem statement SIH26263: "Development of an APAAR ID-Based Student Data Management and Verification Platform for AICTE-Approved Institutions" (AICTE Regulation Bureau). Today is 27 October 2026. I need verified facts, not guesses.

For every item below, give: (a) the finding, (b) the exact source URL, (c) whether the source is OFFICIAL (gov.in / nic.in / aicte.gov.in / meity / abc.gov.in / digilocker) or SECONDARY (news, blog), (d) the date of the source, (e) your confidence (high / medium / low). If you cannot find something, write "NOT FOUND". Do not infer or fill gaps from memory. Quote clause numbers exactly.

1. APAAR ID basics
   - Exact format and length of the APAAR ID, and who issues it (ABC / Ministry of Education)
   - How it links to DigiLocker and the Academic Bank of Credits
   - Whether any API or bulk-verification access exists for institutions or regulators, and what it requires
   - Consent rules, including parental/guardian consent for students under 18

2. AICTE and APAAR
   - Any AICTE circular, notice, or APH 2024-27 / 2026-27 addendum clause that mandates or encourages APAAR for AICTE-approved institutions
   - What student-level data AICTE currently collects (PGDM annual data, and anything for other institutions) and through which portal

3. Seat rules relevant to over-intake and category checks
   - APH 2024-27 provisions on approved intake, supernumerary seats, NRI/NRI-sponsored seats, OCI, PIO, and Foreign National (FN) seats
   - The exact percentage or limit for each, with clause numbers, and any 2026-27 addendum changes

4. Data protection
   - Digital Personal Data Protection Act 2023 and the DPDP Rules: consent, verifiable parental consent for children, purpose limitation, retention, and any exemptions for government or regulatory bodies
   - State clearly what is final law and what is draft or pending

5. Existing systems and prior art
   - Existing duplicate-enrolment or student-verification mechanisms (ABC, National Academic Depository, UDISE+, NSP duplicate checks, AISHE)
   - Any reported problems with duplicate or ghost enrolment in technical education
   - Previous SIH submissions or winners on APAAR or student verification, if any

6. Name and DOB matching
   - Documented challenges with matching Indian names (transliteration, initials, spelling variants) in government identity systems

End with a short list of things you were unable to verify, and anything where official sources conflict with each other.
```

---

## 7. Research results from Grok (27 October 2026)

All of this is **as reported by Grok**. None of the links have been opened by us yet.

### 7.1 Looks solid (official sources cited)

- APAAR ID is a **12-digit** lifelong student ID under "One Nation, One Student ID", implemented through the Academic Bank of Credits; APAAR and the earlier ABC ID are the same number. Source cited: apaar.education.gov.in/faqs and abc.gov.in
- It is pushed to the student's **DigiLocker**; institutions upload credits against it via the National Academic Depository
- **Parental or guardian consent is required for minors** (official FAQ 13). Round 1 also reported a voluntary opt-out, but that came from third-party form sites; **round 2 found no opt-out language in the official FAQ, so treat the opt-out as unverified**
- AICTE collects student-level data **only for PGDM**, through a bulk-import facility (Excel template, CSV, upload via the AICTE portal). Other institutions report aggregates. This is the gap SIH26263 describes. *Refined in section 8.2 (round 5): the bulk import covers PG and PGDM; other programmes report course-wise totals through the Student Enrollment module. Manuals not opened in full.*
- The official portals and a PIB factsheet reference **institutional APIs** for verification, but **no public specification, registration process or open bulk-verification API was found**. This supports the mock adapter and gives an honest feasibility line
- **DPDP Act 2023** is final law. Section 6 (consent) and Section 9 (verifiable parental consent for under-18s) are cited

### 7.2 Weaker than its confidence label (check before use)

- **APH clauses 2.8 and 2.9** (5% NRI seats within approved intake; 15% supernumerary for FN / OCI / CIWG, with one third reserved for CIWG) came from a **university mirror whose filename says APH2024-25**. Confirm in the official aicte.gov.in APH 2024-27 PDF before using clause numbers or percentages
- **2026-27 seat-limit changes** (reported as 15% UG and 25% PG supernumerary) come only from secondary sources. Do not put them on a slide
- **DPDP Rules 2025** (reported as notified 13 November 2025, with the children's-data rule from 13 May 2027) are from secondary analyses. Say "phased commencement" unless the gazette is opened
- Grok's "high confidence" on **absences** (no SIH submissions found, no student-level ghost enrolment reports) is overstated. Not finding something does not prove it does not exist. Make no absence claims in the deck
- The parental-consent form PDFs came from third-party sites such as educationforallinindia.com, which Grok labelled official. The "Odisha HC Dec 2025 order" mention is unsourced
- Grok did **not** cover DPDP Act **Section 7 (legitimate uses)** or **Section 17 (exemptions for government and regulatory bodies)**, which matter for a regulator collecting student data

### 7.3 Not found

- Any AICTE circular, APH clause or addendum mandating or encouraging APAAR for AICTE-approved institutions
- A public technical specification for APAAR institutional APIs or bulk verification
- Reports of student-level duplicate or ghost enrolment in AICTE institutions. The documented problems are **ghost and multi-college faculty**
- Previous SIH submissions on APAAR

### 7.4 What this changes in the plan

1. **Not every student will have an APAAR ID** (rollout is incomplete; the opt-out is unverified, see 7.1), so "missing ID means rejected" is the wrong rule. Add the no-APAAR fallback path and move fuzzy matching with human review into the MVP (section 4.3, item 7)
2. **Do not claim AICTE mandates APAAR.** Frame it as: the Ministry promotes APAAR and its use is voluntary, AICTE has no student-level verification outside PG/PGDM (see 8.2), and the platform uses APAAR where it exists. Mandating it would be a policy decision for AICTE and the Ministry
3. **Use faculty duplication only as adjacent evidence.** Do not present student duplication as a proven problem; present it as something AICTE currently cannot check
4. **Seat limits live in a configurable rules table**, since percentages may differ between APH versions
5. **Double enrolment may be legitimate in some cases** (UGC 2022 guidelines, see 8.1). The platform should flag it for review, not treat it as a violation

### 7.5 Still to open ourselves (about 10 minutes)

1. APAAR FAQs page (format, consent FAQ, institutional API mention)
2. APH 2024-27 clauses 2.8 and 2.9 on aicte.gov.in, plus the official 2026-27 addendum
3. DPDP Act Sections 7, 9 and 17, and the Rules gazette for commencement dates
4. AICTE PGDM bulk import page

---

## 8. Follow-up prompt for Grok (round 2)

```
Follow-up on SIH26263 (APAAR ID-based student data platform for AICTE-approved institutions). Today is 27 October 2026. Same rules as before: for every item give (a) finding, (b) exact URL, (c) OFFICIAL or SECONDARY, (d) source date, (e) confidence. Write NOT FOUND where you cannot find it. Do not infer. Quote clause and section numbers exactly. Where you rely on a mirror or third-party copy, say so and say which version the document is.

1. Official seat rules, verbatim
   - From the OFFICIAL aicte.gov.in APH 2024-27 PDF (not a university mirror): the exact text of the clauses on NRI seats, supernumerary seats for Foreign Nationals / OCI / CIWG, and any PIO mention. Give the PDF URL and the page or clause numbers
   - The OFFICIAL 2026-27 addendum or corrigendum text on any change to these seat limits. If the official text cannot be reached, say so rather than using news reports

2. DPDP Act and Rules, official text
   - Verbatim text of DPDP Act 2023 Section 7 (certain legitimate uses), Section 8 (obligations of data fiduciary), Section 9 (children) and Section 17 (exemptions, especially for State instrumentalities and regulatory functions)
   - The official gazette notification that fixes commencement dates for the DPDP Rules 2025, and which rules apply when

3. APAAR in practice for higher and technical education
   - Verbatim APAAR FAQ text on consent, opt-out, what happens to students who decline, and who generates APAAR IDs for higher-education students
   - Any official figure for how many APAAR IDs have been generated for higher-education students, and any UGC or Ministry circular directing universities to generate or use APAAR (and whether AICTE issued anything similar)
   - Whether the APAAR or ABC / NAD / DigiLocker ecosystem lists any verification API on API Setu (apisetu.gov.in) or similar, with the listed access requirements and the data fields returned

4. Double enrolment: is it always a violation?
   - UGC guidelines on pursuing two academic programmes simultaneously (2022), and whether AICTE has a position for technical programmes
   - Any rule or mechanism against one student holding seats in two institutions in the same year (for example JoSAA or state counselling seat-freezing and multiple-admission checks)

5. What AICTE collects today
   - The field list of the PGDM student bulk import template (column headings)
   - Any AICTE statement on data privacy or consent for student data
   - Any AICTE student-level initiative besides PGDM (scholarship portals, internship portal, Aadhaar-linked student IDs)

6. Scale figures for the impact slide
   - Number of AICTE-approved institutions and total approved intake for the latest year, from the AICTE dashboard or an official report, with the year

7. SIH 2026 format
   - Official SIH 2026 idea-round evaluation criteria, slide or page limits, and whether the idea presentation format has changed from 2025

End with what you could not verify and where sources conflict.
```

Items 1, 2 and 3 matter most. If Grok cannot reach an official PDF, open it ourselves.

---

### 8.1 Round 2 results from Grok (27 October 2026)

As with round 1, these are **as reported by Grok**. No link has been opened by us yet.

**Seat rules (mirror text, not official host)**

- Grok could not retrieve the official aicte.gov.in APH PDF. The text below comes from a FlipHTML5 copy and a university-hosted copy that agree with each other
- **Clause 2.8 (NRI):** 5% of seats **within** the approved intake. Admission authority is the same as for regular admission
- **Clause 2.9 (FN / OCI / CIWG):** 15% supernumerary seats **over and above** the approved intake, per course. One third of these seats is reserved for Children of Indian Workers in the Gulf Countries (CIWG)
- **Definition of supernumerary seats:** intake over and above approved intake, including TFW, OCI / FN / CIWG, lateral entry, PwBD, Kashmiri migrants and PM-USPY seats
- No standalone PIO clause was found in the 2024-27 extracts
- **Design implication:** over-intake is not one "enrolment > intake" check. Regular seats are tested against approved intake, NRI against 5% of intake, and each supernumerary category against its own limit. Hold all limits in a **configurable rules table**
- **2026-27 addendum:** an official page and PDF link exist, but the content was not retrieved (503). Reported changes are secondary only. Ravi's deck cites `Final Addendum 2026-27_Updated.pdf`, while Grok found `Final Addendum 2026-27.pdf`, which suggests an updated version. **Use Ravi's link and do not quote any 2026-27 percentage**

**DPDP Act and Rules**

- **Section 9** (children) is quoted in full: verifiable parental consent before processing a child's data, no processing likely to harm a child's well-being, no tracking or behavioural monitoring, with exemptions that can be prescribed or notified
- **Sections 7, 8 and 17** are summarised only. Section 7 includes State provision of a benefit, service or licence; Section 17 includes regulatory-function exemptions. **Whether either applies to AICTE is a legal question we cannot settle.** The deck should say consent and minimisation are designed in and that the legal basis for regulator processing needs formal review
- **Rules 2025:** notified 13 November 2025 as G.S.R. 846(E), with staggered commencement (Rules 1, 2 and 17-21 on publication; Rule 4 after one year; Rules 3, 5-16, 22, 23 after 18 months). The children's-data rule is reported as applying from **13 May 2027**, so it is not yet in force. Source for dates is secondary
- The full official gazette PDF was not read

**APAAR in practice**

- Official FAQ 13 describes the school flow: verify details, parental consent if a minor, authenticate, create the ID, add it to DigiLocker. FAQ 16 lists mandatory fields including Aadhaar number. FAQ 22 says schools create and authenticate IDs
- **No explicit opt-out language was found** in the FAQ extracts
- Higher-education generation is described on abc.gov.in as a DigiLocker flow. AICTE-recognised bodies can register with ABC
- **Hypothesis to verify, not a fact:** if the higher-education flow also requires an Aadhaar number, foreign nationals may have no APAAR ID, even though the problem statement asks for Foreign National status data. Check this before it goes on a slide
- No AICTE circular mandating APAAR was found. UGC reportedly directed institutions to upload credit data to the ABC portal
- **Figures conflict** (26.30 crore verified in one place, 6.71 crore verified in another). Do not quote either
- No public APAAR verification API listing with fields and access rules was found on API Setu

**Double enrolment**

- UGC Guidelines (April 2022): a student can pursue **two full-time programmes in physical mode if class timings do not overlap**, or one physical and one ODL/online, or up to two ODL/online. No AICTE-specific position was found. Use the MoE page as the source, not the third-party PDF link Grok gave
- No nationwide rule was found that holding seats in two institutions is always a violation. Counselling systems (JoSAA freeze/float/slide) limit it in practice
- **Design implication:** the cross-institution check produces a **"potential dual enrolment, needs review"** flag with reasons, never an automatic violation

**What AICTE collects today**

- PGDM bulk import exists (Excel template, CSV, portal upload); **column headings not publicly found**
- No dedicated AICTE privacy or consent statement for student data was found
- AICTE National Internship Portal reportedly has very large student registrations (secondary). No other student-level data initiative was found

**Scale figures**

- Secondary sources citing the AICTE dashboard: 2,955 institutes and 16,48,221 B.E./B.Tech seats for 2026-27, **engineering UG only**, from an admissions website. If used, label them "engineering UG, 2026-27, as reported", or take the figure from the AICTE dashboard directly

**SIH 2026 format**

- Secondary sources agree on a fixed 6-slide idea submission (title, proposed solution, technical approach, feasibility, impact, references), scored on problem understanding, innovation, technical feasibility, impact and presentation. **No official criteria weights were found**

**Not found (this is not the same as "does not exist")**

PGDM column headings; an AICTE student-data privacy statement; a public APAAR API listing; official SIH criteria weights; a higher-education-only APAAR count; official addendum wording on seat limits; an official-host copy of the APH.

---

## 8.2 Rounds 3 to 5 with Grok (27 October 2026)

As before, everything here is **as reported by Grok**. We have not opened any link. Pages Grok could not open: egazette.gov.in (503), facilities.aicte-india.org/dashboard (503), sih.gov.in guidelines (403), India Code AICTE Act PDF (503), official APH PDF, and the AICTE Student Enrollment manuals (403/404). Where Grok quotes text, it is from search excerpts or mirrors unless stated.

### Round 3: DPDP, APAAR consent, scale, SIH format

**Prompt topics sent:** DPDP Sections 7, 8, 17 verbatim; DPDP Rules 2025 commencement and the parental-consent rule; whether the higher-education APAAR flow needs Aadhaar and what the route is for foreign nationals, OCI and NRIs; official statements on whether APAAR is mandatory; AICTE scale totals; SIH 2026 format and criteria.

**DPDP Act 2023 (text from the India Code PDF, per Grok)**
- **Section 7(b):** State or its instrumentalities may process data to provide a subsidy, benefit, service, certificate, licence or permit "as may be prescribed", under conditions. **Section 7(c):** processing for performance by the State or its instrumentalities of any function under any law in force
- **Section 17(1)(b):** Chapter II (except sub-sections (1) and (5) of section 8), Chapter III and section 16 do not apply where processing is by a court, tribunal or "any other body in India which is entrusted by law with the performance of any judicial or quasi-judicial or regulatory or supervisory function", where necessary for that function
- **Our reading (not legal advice):** AICTE may fall under 17(1)(b) for its own regulatory processing, but only if the processing is necessary for the function. Section 8(1) (fiduciary responsibility) and 8(5) (security safeguards) still apply even then. It would not cover employer verification, which is not a regulatory function, so the consent ledger stays relevant. Whether AICTE qualifies is a legal question we cannot settle
- **Safe slide wording:** "consent and minimisation are designed in; the legal basis for regulator processing needs formal review"
- Section 8 duties quoted include accuracy and completeness where data is used for decisions (8(3)), security safeguards (8(5)), breach intimation (8(6)), erasure (8(7)), and grievance redress (8(10))

**DPDP Rules 2025**
- Notified **13 November 2025**, G.S.R. 846(E). Rules 1, 2 and 17 to 21 in force on publication. Rule 4 after **one year**. Rules 3, 5 to 16, 22 and 23 after **eighteen months**. The gazette states periods, not calendar dates
- **Rule 10** (verifiable consent for a child's data) is in the 18-month group, so it is **not yet in force**. A calendar date such as 13 May 2027 is a secondary-source conversion
- Source: MeitY-hosted PDF (egazette.gov.in returned 503). Grok's verbatim Rule 10 quote may be partly paraphrased, so **do not quote it on a slide**
- **Slide wording:** "phased commencement; the children's-data rule is not yet in force". No calendar date

**APAAR and Aadhaar**
- Official APAAR FAQs (school / UDISE+ flow) list "Name as per Aadhaar, Aadhaar Number" as mandatory and require the UDISE+ name to match the Aadhaar name
- **No official route for students without Aadhaar** (foreign nationals, OCI cardholders, NRIs) was found. No higher-education exception was found either
- Rajya Sabha Unstarred Question 998 (answered 4 December 2024) says the APAAR ID can be created **voluntarily** through DigiLocker. Later replies describe generation as voluntary and based on informed consent of the student, parent or guardian. Higher-education-specific mandate or prohibition: none quoted
- **Design implications:**
  1. Missing APAAR ID is **not an error**, which strongly supports the no-APAAR fallback path
  2. Foreign nationals, OCI and NRI students **may not hold** an APAAR ID. Say "may not", not "do not"
  3. The platform must **not collect or store Aadhaar numbers**. Add this to the data-minimisation line
- **Slide 2 framing:** the Ministry promotes APAAR; participation is voluntary; the platform uses it where it exists and routes students without it to review

**Scale figures (do not use)**
- The dashboard failed to open. Secondary sources (checked 14 October 2026) give Engineering and Technology only: 2,955 institutes and 16,48,221 B.E./B.Tech seats for 2026-27, and 5,872 institutes and 28,16,246 seats across all Engineering and Technology levels. The second pair looks odd, so leave both out unless someone reads the dashboard directly. No all-programmes total was found

**SIH 2026 format**
- The official site gave only an older, qualitative list of criteria: novelty, complexity, clarity and detail in the prescribed format, feasibility, practicability, sustainability, scale of impact, user experience and potential for future work progression. Idea submission is a PPT uploaded as **PDF**
- The 6-slide structure and any file-size limit (such as 25 MB) are **secondary only**. Weights are not published in anything retrieved
- **Action:** check the slides against the qualitative criteria above, but do not call them the 2026 scoring. Export both decks to **PDF as well as PPTX**. Confirm the format and size limit on the portal at submission

### Round 4: AICTE's legal power and the Student Enrollment module

**Prompt topics sent:** AICTE Act 1987 sections on collecting data and inspecting; APH 2024-27 clauses on student data and penalties; any AICTE page on mandatory student-data submission outside PGDM.

**AICTE Act 1987 (text from secondary legal sites, official PDF not opened)**
- **Section 10(a):** the Council may "undertake survey in the various fields of technical education, collect data on all related matters and make forecast" of needed growth. **Section 10(p):** inspect or cause to inspect any technical institution. **Section 10(q):** withhold or discontinue grants where institutions fail to comply with directions
- **Section 11:** inspection of institutions, with notice, communication of views and a report back on action taken
- No section using the phrase "call for information, returns or data" was located. Grok probably lost the sub-section numbering (likely 10(1)); verify on India Code
- **Reading:** this supports data collection in general, but it is not a clear mandate for student-level personal data. Safe wording: "AICTE already collects enrolment data under its Act and the APH; the legal basis for student-level records needs formal review"

**APH 2024-27 (FlipHTML5 mirror titled "Approval Process Handbook 2024-25 to 2026-27", published June 2025; not the official PDF)**
- **Clause 2.25.n** (about p. 48): student enrolment details to be uploaded on the web portal before 30 November of the calendar year. **Clause 4.18** (about p. 59): student enrolment details to be uploaded before the last date in the academic calendar. Other clauses require details for supernumerary, NRI and foreign seats
- **Chapter VII (penalties):** Clause 7.1 allows penal action including fine, no admission, reduced approved intake, withdrawal of approval and criminal action. **Clause 7.3** lists the actions, including a fine of **five times the total fee for the full course per excess admission** (applicable to 7.4(g) and 7.4(h)). **Clause 7.4(g):** excess admission over approved intake is not allowed under any circumstances. **Clause 7.4(h):** violation of admission eligibility norms
- Clause numbers and the fine multiple go on a slide **only after** Ravi's official APH link confirms them
- **Design implication:** because penalties are heavy, a platform flag must never trigger a penalty automatically. This reinforces the human-review design

**Student Enrollment portal module:** see round 5 below, which supersedes the first reading of this item.

### Round 5: what the Student Enrollment module actually collects

**Prompt topics sent:** whether the module takes course-wise totals or one row per student, its field labels, whether non-PGDM institutions have a bulk template, and whether any official page says student-level data is PGDM-only.

**Findings (from search-indexed excerpts; the manual PDFs returned 403/404)**
- The general Student Enrollment module takes **course-wise aggregate totals** against each approved course. It has **no per-student fields** (no name, DOB, Aadhaar or unique ID)
- Labels quoted include NRI and PIO male/female fields for relevant courses, and, in an older manual, SC, ST, OBC, Minority, Physical Handicapped, TFW and General counts, male and female, with "All fields are required" and "Enter 0 if there is no admission"
- A separate bulk Excel / CSV import ("PG Student Excel.xlsm") exists **only for PG and PGDM** student-level data
- Years covered: AY 2017-18 onwards, submitted year-wise for all approved applications; one manual refers to the 2023-24 row. Programmes: "against each approved course", not limited to PGDM
- **No official sentence saying student-level data is collected only for PGDM was found**, but the located manuals consistently show aggregates for the general module and student-level bulk import for PG/PGDM only
- Official pages cited: aicte.gov.in "Submission of Student Enrolment Data" announcement (6 May 2020), plus the two user-manual PDFs listed in the Round 4 prompt. Manuals date from around 2018 to 2024
- Confidence: medium-high for the aggregate nature; low for an exhaustive field list

**What this settles for slide 2**
- The gap is now well supported: institutions report **course-wise totals**, and AICTE has **no student-level record** outside PG/PGDM against which to check those totals, spot over-intake by category, or catch one student in two places
- The "PGDM only" wording in sections 7.1 and 7.4 should be read as **"student-level data is collected only through the PG/PGDM bulk import"**, not "AICTE collects nothing from other institutions"
- **Slide wording:** "Institutions already report enrolment to AICTE as course-wise totals. Student-level records are collected through the PG/PGDM bulk import only. AICTE cannot independently verify who is enrolled." Add "per the AICTE Student Enrollment user manuals, accessed [date]" in the speaker notes, and **ask Ravi to confirm the module screen** before submission, since the manuals could not be opened in full
- **Positioning:** the platform adds student-level verification to the enrolment reporting AICTE already requires. It does not invent a new reporting duty

### Still open after rounds 3 to 5 (only we can close these)

1. Open the AICTE Student Enrollment user manuals (or ask Ravi for a screenshot of the module) to confirm the aggregate-only reading
2. Ravi's official APH and 2026-27 addendum links, to confirm clauses 2.8, 2.9, 2.25.n, 4.18, 7.3 and 7.4(g)(h)
3. India Code, AICTE Act Section 10, for sub-section numbers
4. APAAR FAQ (apaar.education.gov.in/faqs) and the ABC site, to confirm the Aadhaar requirement for higher education
5. Optionally, the AICTE dashboard totals, read directly in a browser
6. Team name and team ID for both decks

**Grok is not needed again.** Every remaining gap is a page Grok could not open, so asking again would return the same errors.

---

## 8.3 Prompts used for rounds 3 to 5 (as sent)

### Round 3 prompt

```
Follow-up on SIH26263 (APAAR ID-based student data platform for AICTE-approved institutions). Today is 27 October 2026. Same rules as before: for every item give (a) finding, (b) exact URL, (c) OFFICIAL or SECONDARY, (d) source date, (e) confidence. Write NOT FOUND where you cannot find it, and say "COULD NOT OPEN" if a page failed to load rather than describing what it probably says. Do not infer. Quote verbatim, and mark any text you are paraphrasing.

1. DPDP Act 2023, official text (indiacode.nic.in, meity.gov.in or egazette.gov.in)
   - Verbatim Section 7 (certain legitimate uses), Section 8 (obligations of Data Fiduciary) and Section 17 (exemptions), including 17(1) and 17(2)
   - Whether anything in Section 7 or 17 expressly covers a statutory regulator collecting data to perform a regulatory function

2. DPDP Rules 2025 commencement
   - The official gazette notification (G.S.R. 846(E) or as correctly numbered): the rule numbers and the date each comes into force, quoted from the gazette
   - The exact rule on verifiable parental consent for children and its commencement date

3. APAAR for higher education
   - Does the higher-education APAAR/ABC ID creation flow require an Aadhaar number? Quote the official source
   - What is the official route for students without Aadhaar, including foreign nationals, OCI cardholders and NRIs?
   - Official statements (Lok Sabha / Rajya Sabha replies, Ministry of Education or UGC letters) on whether APAAR is mandatory or voluntary for higher-education students

4. AICTE scale figures
   - Total AICTE-approved institutions and total approved intake across all programmes (UG, PG, diploma, PGDM) for the latest year on facilities.aicte-india.org/dashboard or an official AICTE report. Give the academic year and say whether the figure is all programmes or one category

5. SIH 2026 format
   - From sih.gov.in or an official SIH 2026 notice: the idea-submission format, slide or page limit, file type and size limit, and evaluation criteria. Say whether the weights are published

End with what you could not open, and where sources conflict.
```

### Round 4 prompt

```
Follow-up on SIH26263. Today is 27 October 2026. Same rules: for each item give (a) finding, (b) exact URL, (c) OFFICIAL or SECONDARY, (d) source date, (e) confidence. Write NOT FOUND or COULD NOT OPEN rather than inferring. Quote verbatim and mark any paraphrase.

1. AICTE Act, 1987 (indiacode.nic.in): the exact section(s) giving AICTE power to call for information, returns or data from approved institutions, and to inspect them. Quote the section number and text.

2. AICTE Approval Process Handbook 2024-27 (official aicte.gov.in PDF if reachable): any clause requiring approved institutions to submit student or admission data (for example on enrolment, admissions or audits), and any clause on penalties for misreporting admissions or exceeding approved intake. Give clause numbers. If the official PDF cannot be opened, say so.

3. Any AICTE notice or portal page describing mandatory student-data submission for institutions other than PGDM (for example through the AICTE approval or data-collection portal).

End with what you could not open.
```

### Round 5 prompt

```
Follow-up on SIH26263. Today is 27 October 2026. Same rules: for each item give (a) finding, (b) exact URL, (c) OFFICIAL or SECONDARY, (d) source date, (e) confidence. Write NOT FOUND or COULD NOT OPEN rather than inferring. Quote verbatim and mark any paraphrase.

1. AICTE Student Enrollment module (aicte.gov.in user manuals, e.g. "Student Enrollment User Manual" and "User Manual for Submitting Student Enrollment"):
   - What exactly does an institution enter? Course-wise totals only, or one row per student? List every field/column name or screenshot label the manual shows (e.g. name, DOB, category, Aadhaar, ID number).
   - Is there a bulk upload or Excel template for non-PGDM institutions? If so, what are its column headings?
   - Which academic years does the manual cover, and which programmes (UG, PG, diploma, PGDM)?

2. Does any official AICTE page say student-level data is collected only for PGDM, or does the Student Enrollment module apply to all approved programmes? Quote the sentence.

End with what you could not open.
```

---

## 8.4 ChatGPT research round (27 October 2026)

Grok's failed items were re-run through ChatGPT. As before, this is **as reported by ChatGPT**. We have not opened any link. ChatGPT separated what it opened from what failed, and used "verbatim" and "paraphrase" labels. Its mirror quotes **agree with Grok's** on clauses 2.8, 2.9, 2.25(n), 4.18, 7.3(g) and 7.4(g)(h), but the two tools may have read copies of the same document, so this is not fully independent confirmation.

### Prompt sent to ChatGPT

```
I'm preparing an idea-submission deck for Smart India Hackathon 2026, problem statement SIH26263 (APAAR ID-based student data platform for AICTE-approved institutions). Today is 27 October 2026. Earlier research tools could not open the pages below. For each item give: (a) the finding, quoted verbatim where possible, (b) the exact URL you actually opened, (c) OFFICIAL (aicte.gov.in, indiacode.nic.in, meity.gov.in, sansad.in, apaar.education.gov.in, abc.gov.in) or SECONDARY (mirror, news, blog), (d) source date, (e) confidence. If a page fails to open, write "COULD NOT OPEN" and do not describe what it probably says. Mark any paraphrase. Do not infer.

1. AICTE Approval Process Handbook 2024-25 to 2026-27: clauses on NRI seats (reported as 2.8), supernumerary seats for FN/OCI/CIWG (reported as 2.9), student enrolment upload (reported as 2.25.n and 4.18), and penalties for excess admission (reported as 7.1, 7.3, 7.4(g), 7.4(h)). Give the exact text, clause numbers and PDF URL. Say whether the copy is official or a mirror.
2. The AICTE Final Addendum 2026-27: any change to seat limits or enrolment reporting.
3. AICTE Student Enrollment user manual(s) on aicte.gov.in: every field or label an institution fills in, and whether it is course-wise totals or one row per student. Also the column headings of the PG/PGDM student bulk import (Excel/CSV) template.
4. AICTE Act 1987: exact text of Section 10 (with sub-section numbers) and Section 11 from India Code.
5. AICTE dashboard (facilities.aicte-india.org/dashboard) or an official AICTE report: total approved institutions and total approved intake, all programmes, latest year.
6. APAAR / ABC: does higher-education APAAR creation require an Aadhaar number, and is there an official route for students without Aadhaar (foreign nationals, OCI cardholders, NRIs)? Is there an official count of APAAR IDs created for higher-education students?
7. Any official AICTE or UGC circular directing AICTE-approved institutions to generate or use APAAR IDs.
8. Official SIH 2026 idea-submission format: slide limit, file type, file-size limit, evaluation criteria.

End with a list of everything you could not open.
```

### APH 2024-27 text (institutional mirror, not the official PDF)

- **Mirror opened:** `pvpitsangli.edu.in/wp-content/uploads/AICTE-APPROVAL-PROCESS-HANDBOOK-2024-25-2025-26-2026-27.pdf`. The official `aicte.gov.in/sites/default/files/APH%20Final.pdf` returned 404. Confidence: medium
- **Clause 2.8(b) (NRI):** five percent of seats **within** the approved intake. Other parts of 2.8 say the admission authority is the same as for regular admission, unfilled NRI seats go to general candidates by merit at regular fee, and branch changes are allowed only where NRI seats are vacant
- **Clause 2.9 (FN / OCI / CIWG):** fifteen percent supernumerary seats **over and above** the approved intake per course, one third reserved for CIWG. **New detail:** existing institutions need **at least 80% average enrolment in the last three years** to be eligible. **Clause 2.9(e):** these seats are not to be filled by Indian citizens
- **Clause 2.25(n)** (extension of approval for existing institutions): enrolment details to be uploaded on the portal before **30 November** of the calendar year. **Clause 4.18** (university chapter): upload before the last date in the academic calendar. **The two deadlines apply to different institution types, so do not treat them as interchangeable**
- **Clause 7.1(a):** violation of the regulations or the handbook makes an institution liable to fine, no admission, reduced approved intake, withdrawal of approval or criminal action
- **Clause 7.3** lists the actions, including (a) suspension of NRI and supernumerary approval for one year, (b) reduction in approved intake, (c) no admission in courses for one year, (d) to (f) withdrawal of approval, and **(g) five times the total fee for the full course, per student, for each excess admission**, which applies to **both 7.4(g) and 7.4(h)**
- **Clause 7.4(g):** excess admission over approved intake is not allowed under any circumstances. **Clause 7.4(h):** violation of admission eligibility norms, including lateral transfer of non-eligible students. 7.4(h) is **not** the excess-admission clause itself, but the fine in 7.3(g) covers both
- **Clause 7.4(m)** (paraphrase only): a PGDM/PGCM provision touching ABC registration and enrolment uploads. Not verified
- **New: the handbook foreword**, as quoted from the mirror, lists "student registration for 'One Nation One Student ID Card' (APAAR ID Card /ABC ID)" as a focus for AICTE-approved institutions. This is **encouragement in a foreword, not a mandate**. It slightly softens the "no AICTE statement on APAAR" finding in 7.3, but the "do not claim AICTE mandates APAAR" rule still holds
- **Use on slides** only after Ravi's official APH link confirms the clause numbers, the 5% / 15% / 1/3 figures and the fine multiple

### Student Enrollment manual (text opened this time)

- ChatGPT read the text of `User_Manual_for_Submitting_Student_Enrollment_Placement_New_Initiative_General_Information.pdf` (official AICTE domain; the screen images did not extract). The 7-step workflow says to select the academic-year row and fill the student enrolment "against each approved course", then submit; once submitted the button is disabled
- This **confirms the course-wise reading** from round 5. **The individual field labels are still unverified.** Grok's partial list (NRI/PIO male and female, SC/ST/OBC etc.) is from search excerpts only
- **PG/PGDM bulk-import template headings: not found by either tool**

### New usable scale and policy figures

- **Lok Sabha answer, 10 August 2026** (official, sansad.in, `AU3608_ygFy6K.pdf`): "more than 2900 award granting institutions from the higher education ecosystem have been registered on ABC portal", "over 4.8 crore APAAR IDs have been created in the higher education ecosystem, with more than 10 crore credit records mapped". Confidence: high
  - This is usable on the impact slide as "over 4.8 crore APAAR IDs in higher education (Lok Sabha reply, 10 August 2026)". It is not AICTE-specific, so do not turn it into a share of AICTE students. It is probably the reliable higher-education figure, and the earlier conflicting numbers (26.30 crore, 6.71 crore) likely mix in school-level IDs. **Do not quote those earlier figures**
- **UGC advisory, 5 June 2026** (`ugc.gov.in`, hosted by UGC, a government body): credit-awarding institutions are required to upload academic records with the APAAR ID, including credit data for exam year 2025, on NAD/ABC by **30 June 2026**. It supports using APAAR in academic records, but it is **not an instruction to generate IDs** and does not single out AICTE institutions
- **ABC FAQ** (`abc.gov.in/faq`): without an APAAR ID, a student cannot use ABC services, including credit transfer and academic progression. Official, undated. Useful as context, but it sits oddly with "voluntary", so describe APAAR as voluntary in creation but required to use ABC services

### Aadhaar and foreign students: still unresolved

- Both tools agree: the official APAAR FAQ lists Aadhaar fields, but it describes the **school / UDISE+ flow**. Neither could confirm that Aadhaar is mandatory for higher-education APAAR creation, and neither found an official route for foreign nationals, OCI cardholders or NRIs. "Not verified" does not mean none exists
- Slide wording stays: "students without an APAAR ID, including those who may not hold one, are handled through the review path". Do not claim foreign nationals cannot get an ID

### Still failed (both tools)

AICTE Act text on India Code (Sections 10 and 11); the AICTE dashboard totals (also the dashboard endpoint for 2026-27 and the AICTE annual report 2024-25, which returned 404); the 2026-27 addendum (no URL verified, so existence and content unknown); the PG/PGDM template headings; the SIH 2026 format (sih.gov.in returned 403; the guideline PDF found is from SIH 2024); the apaar.education.gov.in and abc.gov.in root pages (403); a MeitY APAAR-related PDF (retrieval failed)

### What this round changes

1. The **APH clause details are now better supported** (two tools, two mirrors), but still need the official PDF from Ravi
2. The **eligibility condition in 2.9** (80% average enrolment over three years) can be a rules-table field alongside the 15% limit
3. The **fine in 7.3(g)** covers eligibility violations as well as excess admission, so the reason codes in the report should keep these two categories **separate**
4. The impact slide now has a **verified-in-source, dated higher-education APAAR figure** (4.8 crore, 10 August 2026), pending a check of the Sansad PDF
5. No other plan changes. The **remaining gaps need our own eyes or Ravi**, not another research tool

---

## 9. Next steps

1. Headline idea is **decided: enrolment ledger** (consent-scoped verification is the supporting output layer, see 4.2). Team still confirms the **MVP scope** in section 4.3, including the no-APAAR fallback path
2. Research rounds 1 to 5 plus the ChatGPT round are done (sections 7, 8.1, 8.2, 8.4). Open the sources ourselves using the list at the end of section 8.2: ask Ravi for the official APH and addendum links he already used (his deck cites them), check the Student Enrollment manuals, and verify DPDP and AICTE Act text on India Code
3. Draft the text of all six APAAR slides (with speaker notes and sources, every unverified item flagged in the notes) for Iron and Ravi to review
4. Build the APAAR `.pptx` on the same template as Ravi's deck, and export both decks to PDF as well
5. Fill in **team name and team ID** on both decks
6. Recheck idea counts and statement text on the portal, and confirm the template version and the format and file-size limit with the SPOC
7. Submit both ideas by **28 October 2026**

---

## 10. Honesty rules for both decks

- Say "proposed", not "deployed"
- Label every simulated integration as simulated
- Use synthetic data only and say so
- Claim no measured results, savings or fraud-detection performance
- Keep a human decision-maker in the loop
- Do not claim global novelty
- Put sources, with access dates, in the speaker notes
