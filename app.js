var APPROVED_REGULAR_INTAKE = 2;

var REASONS = {
  "APAAR-FORMAT": {
    message: "The ID is not 12 digits.",
    fix: "Enter the 12-digit APAAR ID."
  },
  "DUP-IN-FILE": {
    message: "The same APAAR ID is on two rows of this file.",
    fix: "Keep one row."
  },
  "OVER-INTAKE": {
    message: "",
    fix: "Drop the extra seat or correct the course."
  },
  "DUAL-ENROL": {
    message: "The same 12-digit ID is already enrolled at another institution this year.",
    fix: "A person reviews it. It may be legitimate."
  },
  "NO-APAAR": {
    message: "No APAAR ID. Matched on name and date of birth.",
    fix: ""
  }
};

function isBlank(value) {
  return value === null || value === undefined || String(value).trim() === "";
}

function isTwelveDigitId(value) {
  return /^\d{12}$/.test(String(value).trim());
}

function editDistance(left, right) {
  var rows = left.length + 1;
  var cols = right.length + 1;
  var grid = [];
  var i;
  var j;
  for (i = 0; i < rows; i += 1) {
    grid[i] = [];
    for (j = 0; j < cols; j += 1) {
      grid[i][j] = 0;
    }
    grid[i][0] = i;
  }
  for (j = 0; j < cols; j += 1) {
    grid[0][j] = j;
  }
  for (i = 1; i < rows; i += 1) {
    for (j = 1; j < cols; j += 1) {
      var cost = left[i - 1] === right[j - 1] ? 0 : 1;
      grid[i][j] = Math.min(
        grid[i - 1][j] + 1,
        grid[i][j - 1] + 1,
        grid[i - 1][j - 1] + cost
      );
    }
  }
  return grid[left.length][right.length];
}

function isSimilarName(left, right) {
  var a = left.trim().toLowerCase();
  var b = right.trim().toLowerCase();
  if (a === b) {
    return false;
  }
  var distance = editDistance(a, b);
  return distance > 0 && distance <= 2;
}

function seenIdEarlier(index) {
  var id = students[index].apaarId;
  var i;
  for (i = 0; i < index; i += 1) {
    if (students[i].apaarId === id) {
      return true;
    }
  }
  return false;
}

function ledgerMatchById(student) {
  var i;
  for (i = 0; i < ledger.length; i += 1) {
    var row = ledger[i];
    if (
      row.apaarId === student.apaarId &&
      row.institution !== student.institution &&
      row.academicYear === student.academicYear
    ) {
      return row;
    }
  }
  return null;
}

function ledgerMatchByName(student) {
  var i;
  for (i = 0; i < ledger.length; i += 1) {
    var row = ledger[i];
    if (row.dob === student.dob && isSimilarName(student.name, row.name)) {
      return row;
    }
  }
  return null;
}

function tallyRegularEnrolment() {
  var counted = 0;
  var held = 0;
  var seen = {};
  var i;
  for (i = 0; i < students.length; i += 1) {
    var student = students[i];
    if (student.category !== "Regular") {
      continue;
    }
    if (!isTwelveDigitId(student.apaarId)) {
      held += 1;
      continue;
    }
    if (seen[student.apaarId]) {
      continue;
    }
    seen[student.apaarId] = true;
    counted += 1;
  }
  return { counted: counted, held: held };
}

function heldLine(student) {
  return student.name.split(" ")[0] + "'s row is held until his ID is fixed.";
}

function buildFindings() {
  var report = [];
  var review = [];
  var tally = tallyRegularEnrolment();
  var file = students[0];
  var i;

  for (i = 0; i < students.length; i += 1) {
    var student = students[i];

    if (!isBlank(student.apaarId) && !isTwelveDigitId(student.apaarId)) {
      report.push({
        subject: student.name,
        code: "APAAR-FORMAT",
        message: REASONS["APAAR-FORMAT"].message,
        fix: REASONS["APAAR-FORMAT"].fix,
        held: heldLine(student)
      });
    }

    if (isTwelveDigitId(student.apaarId) && seenIdEarlier(i)) {
      report.push({
        subject: student.name,
        code: "DUP-IN-FILE",
        message: REASONS["DUP-IN-FILE"].message,
        fix: REASONS["DUP-IN-FILE"].fix
      });
    }

    if (isTwelveDigitId(student.apaarId) && !seenIdEarlier(i) && ledgerMatchById(student)) {
      report.push({
        subject: student.name,
        code: "DUAL-ENROL",
        message: REASONS["DUAL-ENROL"].message,
        fix: REASONS["DUAL-ENROL"].fix
      });
      review.push({
        subject: student.name,
        code: "DUAL-ENROL",
        note: REASONS["DUAL-ENROL"].message + " It may be legitimate.",
        confidence: 0.95
      });
    }

    if (isBlank(student.apaarId)) {
      var nameMatch = ledgerMatchByName(student);
      var note = REASONS["NO-APAAR"].message;
      if (nameMatch) {
        note = note + " Possible match: " + nameMatch.name + ".";
      }
      review.push({
        subject: student.name,
        code: "NO-APAAR",
        note: note,
        confidence: nameMatch ? 0.62 : null
      });
    }
  }

  if (tally.counted > APPROVED_REGULAR_INTAKE) {
    report.push({
      subject: file.course,
      code: "OVER-INTAKE",
      message:
        "Regular claims would be " +
        tally.counted +
        " against an approved intake of " +
        APPROVED_REGULAR_INTAKE +
        ".",
      fix: REASONS["OVER-INTAKE"].fix
    });
  }

  return {
    report: report,
    review: review,
    dashboard: {
      institution: file.institution,
      academicYear: file.academicYear,
      course: file.course,
      approvedIntake: APPROVED_REGULAR_INTAKE,
      regularEnrolment: tally.counted + " counted, " + tally.held + " held",
      status: tally.counted > APPROVED_REGULAR_INTAKE ? "Flagged" : "Not flagged",
      stillInReview: review.length
    }
  };
}

function addText(parent, text, className) {
  var p = document.createElement("p");
  if (className) {
    p.className = className;
  }
  p.textContent = text;
  parent.appendChild(p);
  return p;
}

function renderReport(findings) {
  var screen = document.getElementById("screen");
  var dash = findings.dashboard;
  addText(
    screen,
    dash.institution + ", academic year " + dash.academicYear + ", " + dash.course + "."
  );
  var i;
  for (i = 0; i < findings.report.length; i += 1) {
    var item = findings.report[i];
    var block = document.createElement("section");
    block.className = "card";
    addText(block, item.subject, "subject");
    addText(block, "Reason: " + item.code, "reason");
    addText(block, item.message, "message");
    addText(block, "Fix: " + item.fix, "fix");
    if (item.held) {
      addText(block, item.held, "held");
    }
    screen.appendChild(block);
  }
}

function renderReview(findings) {
  var screen = document.getElementById("screen");
  var i;
  for (i = 0; i < findings.review.length; i += 1) {
    var item = findings.review[i];
    var block = document.createElement("section");
    block.className = "card";
    addText(block, item.subject, "subject");
    addText(block, "Reason: " + item.code, "reason");
    addText(block, item.note, "message");
    if (item.confidence !== null) {
      addText(block, "illustrative score " + item.confidence, "score");
    }
    var label = addText(block, "In review");
    var accept = document.createElement("button");
    accept.type = "button";
    accept.textContent = "Accept";
    var sendBack = document.createElement("button");
    sendBack.type = "button";
    sendBack.textContent = "Send back";
    accept.addEventListener("click", function (status) {
      return function () {
        status.textContent = "Accepted";
      };
    }(label));
    sendBack.addEventListener("click", function (status) {
      return function () {
        status.textContent = "Sent back";
      };
    }(label));
    block.appendChild(accept);
    block.appendChild(sendBack);
    screen.appendChild(block);
  }
}

function renderDashboard(findings) {
  var screen = document.getElementById("screen");
  var dash = findings.dashboard;
  addText(screen, dash.institution + ", academic year " + dash.academicYear + ", " + dash.course + ".");
  addText(screen, "Approved intake: " + dash.approvedIntake);
  addText(screen, "Regular enrolment: " + dash.regularEnrolment);
  addText(screen, "1 Foreign National seat, not counted against regular intake");
  addText(screen, "Institution status: " + dash.status);
  addText(screen, "Still in review: " + dash.stillInReview);
}

function renderPage() {
  var page = document.body.getAttribute("data-page");
  var findings = buildFindings();
  if (page === "report") {
    renderReport(findings);
  } else if (page === "review") {
    renderReview(findings);
  } else if (page === "dashboard") {
    renderDashboard(findings);
  }
}

if (typeof document !== "undefined") {
  renderPage();
}
