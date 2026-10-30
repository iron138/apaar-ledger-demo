# APAAR enrolment ledger demo

One-day static demo. Plain HTML, CSS, and JavaScript. No server. Uncertain cases go to a person. Nothing is auto-rejected. All names and IDs are synthetic.

Store the six student rows and the two ledger rows in `data.js`. `app.js` computes the reason codes from that data. Do not type the report by hand. Do not add upload or CSV parsing.

## Screens

Three views, linked by simple page links. The rows live in `data.js`. `app.js` computes what the screens show. Every page shows the banner "Prototype. Synthetic data. Simulated APAAR registry."

- **Report.** The planted problems for ABC Institute of Technology, academic year 2025-26, course B.Tech Computer Science. Each problem shows a reason code, a plain sentence, and a suggested fix. `OVER-INTAKE` is on the course.
- **Review queue.** Two cases a person must decide. Each has a short note and a confidence score. Two buttons, **Accept** and **Send back**, only change the label on the page.
Show every confidence score with the label "illustrative score".
- **Dashboard.** A few numbers from the same fake list: approved intake 2, regular enrolment "3 counted, 1 held", institution status Flagged, and how many items are still in review.
Dashboard extras for the demo video: (1) stat cards for approved intake, regular enrolment counted, held, institution status and still in review; (2) a simple seat bar made with CSS only; (3) one chip per reason code with a count, and clicking a chip lists the matching subjects; (4) decisions made on the Review queue update "Still in review" on the Dashboard for the current browser tab only, with a "Reset demo" button. Everything is computed from data.js. No library, no install, no server. Nothing is auto-rejected, and Accept or Send back never changes the OVER-INTAKE flag.
Auto demo for the video: a new file demo.js adds an optional guided walkthrough. It is off unless the person clicks "Play auto demo" or opens index.html?demo=run. It highlights parts of the real pages, shows a caption for each step, clicks the existing Accept, Send back and chip buttons, and moves between the three pages by itself. It has Pause, Skip, Restart, Stop and a speed choice. demo.js uses only the URL for state, with no storage of its own, no library, no install, no server. It never changes buildFindings, data.js, the reason rules or what the pages compute. Captions say "proposed" or "simulated" where that is true, use "illustrative score", claim no results, and never say anything is auto-rejected.

## Reason codes

Five codes. Each has a plain message and a suggested fix.

- `APAAR-FORMAT` — the ID is not 12 digits. Fix: enter the 12-digit APAAR ID. Shown on the report. Rohan's row is held until his ID is fixed.
- `DUP-IN-FILE` — the same APAAR ID is on two rows of this file. Fix: keep one row. Shown on the report.
- `OVER-INTAKE` — regular claims would be 3 against an approved intake of 2. Fix: drop the extra seat or correct the course. Shown on the course, not on Kabir. This is separate from a dual-enrolment flag.
- `DUAL-ENROL` — the same 12-digit ID is already enrolled at another institution this year. Fix: a person reviews it. It may be legitimate. Shown on the report and in the review queue. Confidence 0.95 because the ID matches exactly.
- `NO-APAAR` — no APAAR ID. Matched on name and date of birth. Shown only in the review queue. Confidence 0.62. Never auto-reject.

## Fake students

One institution file, plus two existing rows already on the ledger. No Aadhaar, no marks.

- Ananya Sharma, 2006-04-12, APAAR `123456789012`, ABC Institute of Technology, B.Tech Computer Science, Regular. Clean.
- Rohan Mehta, 2005-11-03, APAAR `12345`, same institution and course, Regular. `APAAR-FORMAT`.
- Ananya Sharma, same date and APAAR, second row. `DUP-IN-FILE`.
- Kabir Das, 2006-08-09, APAAR `345678901234`, same institution and course, Regular. Counts toward the course total. The invalid ID and the duplicate row do not count.
- Meera Iyer, 2005-02-17, APAAR `456789012345`, same institution and course, Regular. `DUAL-ENROL`.
- Ledger row already stored: Meera Iyer, same APAAR, XYZ Polytechnic, Diploma Mechanical, Regular, 2025-26.
- Ledger row already stored: Sana Kureshi, 2007-06-01, XYZ Polytechnic, Diploma Mechanical, Regular, 2025-26. Possible match for Sana Qureshi: similar name, exact date of birth, which is why `NO-APAAR` confidence is 0.62.
- Sana Qureshi, 2007-06-01, APAAR blank, ABC Institute of Technology, B.Tech Computer Science, Foreign National. `NO-APAAR`. Sana is a Foreign National seat and is not counted against the regular intake of 2.

## Not building

- Backend, database, login, roles, audit log
- A real file upload or CSV parser (`app.js` computes the report from `data.js`)
- Real APAAR, DigiLocker, SMS, or email
- Employer check, consent ledger, QR code, certificate print, PDF export
- Frameworks, install steps, chart libraries
- Aadhaar numbers, marks, or real student records
- Automatic rejection or an automatic penalty
- Mobile app, multiple languages, seat-category rules table
