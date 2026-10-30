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

function enrolmentNames() {
  var counted = [];
  var held = [];
  var foreignNational = [];
  var seen = {};
  var i;
  for (i = 0; i < students.length; i += 1) {
    var student = students[i];
    if (student.category === "Foreign National") {
      foreignNational.push(student.name);
      continue;
    }
    if (student.category !== "Regular") {
      continue;
    }
    if (!isTwelveDigitId(student.apaarId)) {
      held.push(student.name);
      continue;
    }
    if (seen[student.apaarId]) {
      continue;
    }
    seen[student.apaarId] = true;
    counted.push(student.name);
  }
  return {
    counted: counted,
    held: held,
    foreignNational: foreignNational
  };
}

function renderDashboard(findings) {
  var screen = document.getElementById("screen");
  var dash = findings.dashboard;
  var names = enrolmentNames();
  var over = names.counted.length - dash.approvedIntake;

  function statCard(label, value, flagged, nameList) {
    var card = document.createElement(nameList ? "button" : "div");
    card.className = "stat";
    if (nameList) {
      card.type = "button";
    }
    var labelEl = document.createElement("p");
    labelEl.className = "stat-label";
    labelEl.textContent = label;
    var valueEl = document.createElement("p");
    valueEl.className = flagged ? "stat-value flagged" : "stat-value";
    valueEl.textContent = value;
    card.appendChild(labelEl);
    card.appendChild(valueEl);
    if (nameList) {
      var list = document.createElement("ul");
      list.className = "stat-names";
      list.hidden = true;
      var n;
      for (n = 0; n < nameList.length; n += 1) {
        var item = document.createElement("li");
        item.textContent = nameList[n];
        list.appendChild(item);
      }
      card.appendChild(list);
      card.addEventListener("click", function () {
        list.hidden = !list.hidden;
      });
    }
    return card;
  }

  function reasonGroups() {
    var groups = {};
    var codes = [];
    var key;
    for (key in REASONS) {
      if (Object.prototype.hasOwnProperty.call(REASONS, key)) {
        groups[key] = {
          code: key,
          subjects: [],
          message: REASONS[key].message
        };
        codes.push(key);
      }
    }
    var items = findings.report.concat(findings.review);
    var seen = {};
    var i;
    for (i = 0; i < items.length; i += 1) {
      var item = items[i];
      var pair = item.subject + "\n" + item.code;
      if (seen[pair] || !groups[item.code]) {
        continue;
      }
      seen[pair] = true;
      groups[item.code].subjects.push(item.subject);
      if (!groups[item.code].message && item.message) {
        groups[item.code].message = item.message;
      }
    }
    var result = [];
    for (i = 0; i < codes.length; i += 1) {
      result.push(groups[codes[i]]);
    }
    return result;
  }

  addText(
    screen,
    dash.institution + ", academic year " + dash.academicYear + ", " + dash.course + "."
  );

  var stats = document.createElement("div");
  stats.className = "stats";
  stats.appendChild(statCard("Approved intake", String(dash.approvedIntake), false));
  stats.appendChild(statCard("Counted", String(names.counted.length), false, names.counted));
  stats.appendChild(statCard("Held", String(names.held.length), false, names.held));
  stats.appendChild(statCard("Institution status", dash.status, dash.status === "Flagged"));
  stats.appendChild(statCard("Still in review", String(dash.stillInReview), false));
  screen.appendChild(stats);

  var bar = document.createElement("div");
  bar.className = "seat-bar";
  var s;
  for (s = 0; s < dash.approvedIntake; s += 1) {
    var seat = document.createElement("span");
    seat.className = "seat";
    bar.appendChild(seat);
  }
  if (over > 0) {
    var o;
    for (o = 0; o < over; o += 1) {
      var extra = document.createElement("span");
      extra.className = "seat seat-over";
      bar.appendChild(extra);
    }
  }
  screen.appendChild(bar);
  if (over > 0) {
    addText(screen, "over by " + over, "seat-label");
  }

  addText(screen, "1 Foreign National seat, not counted against regular intake");

  var chips = document.createElement("div");
  chips.className = "chips";
  var groups = reasonGroups();
  var c;
  for (c = 0; c < groups.length; c += 1) {
    var group = groups[c];
    var block = document.createElement("div");
    block.className = "chip-block";
    var chip = document.createElement("button");
    chip.type = "button";
    chip.className = "chip";
    chip.textContent = group.code + " " + group.subjects.length;
    var detail = document.createElement("div");
    detail.className = "chip-detail";
    detail.hidden = true;
    var subjectList = document.createElement("ul");
    var j;
    for (j = 0; j < group.subjects.length; j += 1) {
      var subject = document.createElement("li");
      subject.textContent = group.subjects[j];
      subjectList.appendChild(subject);
    }
    detail.appendChild(subjectList);
    addText(detail, group.message, "message");
    chip.addEventListener("click", function (panel) {
      return function () {
        panel.hidden = !panel.hidden;
      };
    }(detail));
    block.appendChild(chip);
    block.appendChild(detail);
    chips.appendChild(block);
  }
  screen.appendChild(chips);
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
