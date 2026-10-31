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

// ---------------------------------------------------------------------------
// Rendering. Everything below only draws what buildFindings() and data.js
// already say. No rule, count or reason code is decided here.
// ---------------------------------------------------------------------------

// Fixed icon shapes (no user data inside), drawn with CSS stroke colours.
var ICONS = {
  seat: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 11V6a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v5"/><path d="M5 11h14v4H5z"/><path d="M7 15v5M17 15v5"/></svg>',
  check: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M8 12.5l2.6 2.6L16.2 9.4"/></svg>',
  hold: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M10 9v6M14 9v6"/></svg>',
  flag: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 21V4"/><path d="M5 4h12l-2.5 4.5L17 13H5"/></svg>',
  person: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="8" r="3.6"/><path d="M5 20.5a7 7 0 0 1 14 0"/></svg>',
  file: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5M9 13h6M9 17h4"/></svg>',
  alert: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3.5l9.5 16.5h-19z"/><path d="M12 10v4.5M12 17.5h.01"/></svg>',
  chevron: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg>',
  arrow: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>',
  tag: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 12V4h8l10 10-8 8z"/><circle cx="7.5" cy="8.5" r="1.3"/></svg>',
  layers: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3l9 5-9 5-9-5z"/><path d="M3 13l9 5 9-5"/></svg>'
};

// Presentation only: which kind of follow-up each reason code asks for.
// These words restate the "Fix" text in data terms; they decide nothing.
var REASON_KIND = {
  "APAAR-FORMAT": { kind: "data", label: "Institution fixes the row" },
  "DUP-IN-FILE": { kind: "data", label: "Institution fixes the row" },
  "OVER-INTAKE": { kind: "seat", label: "Course over approved intake" },
  "DUAL-ENROL": { kind: "person", label: "A person decides" },
  "NO-APAAR": { kind: "person", label: "A person decides" }
};

function addText(parent, text, className) {
  var p = document.createElement("p");
  if (className) {
    p.className = className;
  }
  p.textContent = text;
  parent.appendChild(p);
  return p;
}

function el(tag, className, text) {
  var node = document.createElement(tag);
  if (className) {
    node.className = className;
  }
  if (text !== undefined && text !== null) {
    node.textContent = text;
  }
  return node;
}

function icon(name, className) {
  var span = el("span", "icon" + (className ? " " + className : ""));
  span.innerHTML = ICONS[name] || "";
  return span;
}

function plural(n, one, many) {
  return n + " " + (n === 1 ? one : many);
}

function contextBar(screen, dash, withStatus) {
  var bar = el("div", "context");
  var items = [
    ["Institution", dash.institution],
    ["Academic year", dash.academicYear],
    ["Course", dash.course]
  ];
  var i;
  for (i = 0; i < items.length; i += 1) {
    var item = el("p", "context-item");
    item.appendChild(el("span", "context-label", items[i][0]));
    item.appendChild(el("span", "context-value", items[i][1]));
    bar.appendChild(item);
  }
  if (withStatus) {
    var flagged = dash.status === "Flagged";
    var status = el("p", "status-pill " + (flagged ? "is-flagged" : "is-clear"));
    status.appendChild(icon(flagged ? "flag" : "check"));
    status.appendChild(el("span", null, "Institution status: " + dash.status));
    bar.appendChild(status);
  }
  screen.appendChild(bar);
}

function scoreMeter(parent, confidence) {
  var wrap = el("div", "score-meter");
  var track = el("span", "score-track");
  var fill = el("span", "score-fill");
  fill.style.width = Math.round(confidence * 100) + "%";
  track.appendChild(fill);
  wrap.appendChild(track);
  wrap.appendChild(el("span", "score", "illustrative score " + confidence));
  parent.appendChild(wrap);
  return wrap;
}

function reportCard(item, index) {
  var block = document.createElement("section");
  block.className = "card";
  block.setAttribute("data-kind", (REASON_KIND[item.code] || {}).kind || "data");
  block.style.setProperty("--i", index);
  addText(block, item.subject, "subject");
  addText(block, "Reason: " + item.code, "reason");
  addText(block, item.message, "message");
  addText(block, "Fix: " + item.fix, "fix");
  if (item.held) {
    addText(block, item.held, "held");
  }
  return block;
}

function groupHeading(screen, title, subtitle, count) {
  var head = el("div", "group-head");
  var titleRow = el("h2", "group-title", title);
  titleRow.appendChild(el("span", "group-count", String(count)));
  head.appendChild(titleRow);
  head.appendChild(el("p", "group-sub", subtitle));
  screen.appendChild(head);
}

function renderReport(findings) {
  var screen = document.getElementById("screen");
  var dash = findings.dashboard;
  contextBar(screen, dash, false);

  // Split the computed findings: the course-level flag versus problems on rows.
  var rowItems = [];
  var courseItems = [];
  var i;
  for (i = 0; i < findings.report.length; i += 1) {
    if (findings.report[i].subject === dash.course) {
      courseItems.push(findings.report[i]);
    } else {
      rowItems.push(findings.report[i]);
    }
  }

  var summary = el("div", "stats report-stats");
  summary.appendChild(statCard({
    index: 0, tone: "navy", icon: "file",
    label: "Rows checked",
    value: String(students.length),
    caption: "From the institution's file"
  }));
  summary.appendChild(statCard({
    index: 1, tone: "amber", icon: "alert",
    label: "Row-level problems",
    value: String(rowItems.length),
    caption: "Each with a reason code and a fix"
  }));
  summary.appendChild(statCard({
    index: 2, tone: courseItems.length ? "red" : "green", icon: "flag",
    label: "Course-level flags",
    value: String(courseItems.length),
    caption: courseItems.length ? "Course over its approved intake" : "No course over its approved intake"
  }));
  summary.appendChild(statCard({
    index: 3, tone: "blue", icon: "person",
    label: "Sent to a person",
    value: String(findings.review.length),
    caption: "Review queue · nothing is auto-rejected"
  }));
  screen.appendChild(summary);

  var index = 0;
  if (rowItems.length) {
    groupHeading(screen, "Row-level problems", "Each row gets a reason code, a plain message and a suggested fix.", rowItems.length);
    var rowGrid = el("div", "card-grid card-grid-3");
    for (i = 0; i < rowItems.length; i += 1) {
      rowGrid.appendChild(reportCard(rowItems[i], index));
      index += 1;
    }
    screen.appendChild(rowGrid);
  }
  if (courseItems.length) {
    groupHeading(screen, "Course-level flag", "Counted against the course, not against any one student.", courseItems.length);
    var courseGrid = el("div", "card-grid card-grid-course");
    for (i = 0; i < courseItems.length; i += 1) {
      courseGrid.appendChild(reportCard(courseItems[i], index));
      index += 1;
    }
    screen.appendChild(courseGrid);
  }
}

function renderReview(findings) {
  var screen = document.getElementById("screen");
  addText(screen, "A person decides each case below. Nothing is auto-rejected.", "lede");
  var grid = el("div", "card-grid");
  var i;
  for (i = 0; i < findings.review.length; i += 1) {
    var item = findings.review[i];
    var block = document.createElement("section");
    block.className = "card";
    block.setAttribute("data-kind", "person");
    block.style.setProperty("--i", i);
    addText(block, item.subject, "subject");
    addText(block, "Reason: " + item.code, "reason");
    addText(block, item.note, "message");
    if (item.confidence !== null) {
      scoreMeter(block, item.confidence);
    }
    var label = addText(block, "In review", "decision");
    label.setAttribute("data-state", "open");
    var actions = el("div", "actions");
    var accept = document.createElement("button");
    accept.type = "button";
    accept.className = "btn btn-primary";
    accept.textContent = "Accept";
    var sendBack = document.createElement("button");
    sendBack.type = "button";
    sendBack.className = "btn btn-secondary";
    sendBack.textContent = "Send back";
    accept.addEventListener("click", function (status) {
      return function () {
        status.textContent = "Accepted";
        status.setAttribute("data-state", "accepted");
      };
    }(label));
    sendBack.addEventListener("click", function (status) {
      return function () {
        status.textContent = "Sent back";
        status.setAttribute("data-state", "sent-back");
      };
    }(label));
    actions.appendChild(accept);
    actions.appendChild(sendBack);
    block.appendChild(actions);
    grid.appendChild(block);
  }
  screen.appendChild(grid);
}

// Same counting rule as tallyRegularEnrolment(), with names kept so the
// dashboard can say who sits in each group.
function enrolmentNames() {
  var counted = [];
  var held = [];
  var duplicate = [];
  var foreignNational = [];
  var other = [];
  var seen = {};
  var i;
  for (i = 0; i < students.length; i += 1) {
    var student = students[i];
    if (student.category === "Foreign National") {
      foreignNational.push(student.name);
      continue;
    }
    if (student.category !== "Regular") {
      other.push(student.name);
      continue;
    }
    if (!isTwelveDigitId(student.apaarId)) {
      held.push(student.name);
      continue;
    }
    if (seen[student.apaarId]) {
      duplicate.push(student.name);
      continue;
    }
    seen[student.apaarId] = true;
    counted.push(student.name);
  }
  return {
    counted: counted,
    held: held,
    duplicate: duplicate,
    foreignNational: foreignNational,
    other: other,
    total: students.length
  };
}

function reasonGroups(findings) {
  var groups = {};
  var codes = [];
  var key;
  for (key in REASONS) {
    if (Object.prototype.hasOwnProperty.call(REASONS, key)) {
      groups[key] = {
        code: key,
        subjects: [],
        message: REASONS[key].message,
        fix: REASONS[key].fix,
        onReport: false,
        inReview: false
      };
      codes.push(key);
    }
  }
  var seen = {};
  var i;
  function collect(list, where) {
    for (i = 0; i < list.length; i += 1) {
      var item = list[i];
      var group = groups[item.code];
      if (!group) {
        continue;
      }
      group[where] = true;
      var pair = item.subject + "\n" + item.code;
      if (seen[pair]) {
        continue;
      }
      seen[pair] = true;
      group.subjects.push(item.subject);
      if (!group.message && item.message) {
        group.message = item.message;
      }
    }
  }
  collect(findings.report, "onReport");
  collect(findings.review, "inReview");
  var result = [];
  for (i = 0; i < codes.length; i += 1) {
    result.push(groups[codes[i]]);
  }
  return result;
}

function panel(className, title, subtitle, iconName) {
  var section = el("section", "panel " + className);
  var head = el("header", "panel-head");
  if (iconName) {
    head.appendChild(icon(iconName, "panel-icon"));
  }
  var titles = el("div", "panel-titles");
  titles.appendChild(el("h2", "panel-title", title));
  if (subtitle) {
    titles.appendChild(el("p", "panel-sub", subtitle));
  }
  head.appendChild(titles);
  section.appendChild(head);
  return section;
}

function statCard(opts) {
  var card = el(opts.names ? "button" : "div", "stat tone-" + opts.tone);
  card.style.setProperty("--i", opts.index);
  if (opts.names) {
    card.type = "button";
    card.setAttribute("aria-expanded", "false");
  }
  var top = el("span", "stat-top");
  top.appendChild(icon(opts.icon, "stat-icon"));
  top.appendChild(el("span", "stat-label", opts.label));
  card.appendChild(top);
  card.appendChild(el("span", opts.flagged ? "stat-value flagged" : "stat-value", opts.value));
  card.appendChild(el("span", "stat-caption", opts.caption));
  if (opts.delta) {
    var delta = el("span", "stat-delta");
    delta.appendChild(icon("alert"));
    delta.appendChild(el("span", null, opts.delta));
    card.appendChild(delta);
  }
  if (opts.names) {
    var hint = el("span", "stat-hint");
    var hintText = el("span", null, "Show names");
    hint.appendChild(hintText);
    hint.appendChild(icon("chevron"));
    card.appendChild(hint);
    var list = el("span", "stat-names");
    list.hidden = true;
    var n;
    for (n = 0; n < opts.names.length; n += 1) {
      list.appendChild(el("span", "stat-name", opts.names[n]));
    }
    card.appendChild(list);
    card.addEventListener("click", function () {
      list.hidden = !list.hidden;
      card.setAttribute("aria-expanded", list.hidden ? "false" : "true");
      hintText.textContent = list.hidden ? "Show names" : "Hide names";
    });
  }
  return card;
}

function seatPanel(dash, names) {
  var counted = names.counted.length;
  var over = counted - dash.approvedIntake;
  var section = panel(
    "seat-panel",
    "Seat check",
    "Regular claims against the approved intake for " + dash.course,
    "seat"
  );

  var hero = el("div", "seat-hero");
  var figure = el("p", "seat-figure");
  figure.appendChild(el("span", "seat-num", String(counted)));
  figure.appendChild(el("span", "seat-of", counted === 1 ? "regular claim" : "regular claims"));
  figure.appendChild(el("span", "seat-vs", "vs"));
  figure.appendChild(el("span", "seat-num", String(dash.approvedIntake)));
  figure.appendChild(el("span", "seat-of", dash.approvedIntake === 1 ? "approved seat" : "approved seats"));
  hero.appendChild(figure);
  if (over > 0) {
    var label = el("p", "seat-label is-over");
    label.appendChild(icon("alert"));
    label.appendChild(el("span", null, "Over by " + over));
    hero.appendChild(label);
  } else {
    var ok = el("p", "seat-label is-ok");
    ok.appendChild(icon("check"));
    ok.appendChild(el("span", null, "Within intake"));
    hero.appendChild(ok);
  }
  section.appendChild(hero);

  var bar = el("div", "seat-bar");
  bar.setAttribute("role", "img");
  bar.setAttribute(
    "aria-label",
    counted + " regular claims against " + dash.approvedIntake + " approved seats" +
      (over > 0 ? ", over by " + over : "") +
      ". " + names.foreignNational.length + " Foreign National seat counted separately."
  );
  var s;
  var seatIndex = 0;
  for (s = 0; s < dash.approvedIntake; s += 1) {
    var seat = el("span", "seat-slot");
    seat.style.setProperty("--i", seatIndex);
    seatIndex += 1;
    seat.appendChild(el("span", s < counted ? "seat" : "seat seat-empty"));
    seat.appendChild(el("span", "seat-caption", "Seat " + (s + 1)));
    bar.appendChild(seat);
  }
  if (over > 0) {
    bar.appendChild(el("span", "seat-limit"));
    var o;
    for (o = 0; o < over; o += 1) {
      var extra = el("span", "seat-slot");
      extra.style.setProperty("--i", seatIndex);
      seatIndex += 1;
      extra.appendChild(el("span", "seat seat-over"));
      extra.appendChild(el("span", "seat-caption", "Over intake"));
      bar.appendChild(extra);
    }
  }
  if (names.foreignNational.length > 0) {
    bar.appendChild(el("span", "seat-divider"));
    var f;
    for (f = 0; f < names.foreignNational.length; f += 1) {
      var fn = el("span", "seat-slot");
      fn.style.setProperty("--i", seatIndex);
      seatIndex += 1;
      fn.appendChild(el("span", "seat seat-fn"));
      fn.appendChild(el("span", "seat-caption", "Foreign National"));
      bar.appendChild(fn);
    }
  }
  section.appendChild(bar);

  var legend = el("ul", "legend");
  var entries = [["seat", "Approved seat, claimed"]];
  if (over > 0) {
    entries.push(["seat-over", "Claim above approved intake"]);
  }
  if (names.foreignNational.length > 0) {
    entries.push(["seat-fn", "Foreign National seat (separate)"]);
  }
  var e;
  for (e = 0; e < entries.length; e += 1) {
    var li = el("li");
    li.appendChild(el("span", "swatch " + entries[e][0]));
    li.appendChild(el("span", null, entries[e][1]));
    legend.appendChild(li);
  }
  section.appendChild(legend);

  if (names.foreignNational.length > 0) {
    addText(
      section,
      plural(names.foreignNational.length, "Foreign National seat", "Foreign National seats") +
        ", not counted against regular intake",
      "seat-note"
    );
  }
  if (over > 0) {
    addText(
      section,
      "The flag sits on the course, not on any one student.",
      "panel-foot"
    );
  }
  return section;
}

function rowsPanel(names) {
  var parts = [
    { key: "counted", label: "Counted", detail: "valid 12-digit ID, first row", list: names.counted },
    { key: "held", label: "Held", detail: "ID not 12 digits, held until fixed", list: names.held },
    { key: "duplicate", label: "Duplicate row", detail: "same ID twice, not counted again", list: names.duplicate },
    { key: "fn", label: "Foreign National", detail: "separate seat, not regular intake", list: names.foreignNational },
    { key: "other", label: "Other category", detail: "not counted as regular", list: names.other }
  ];
  var section = panel(
    "rows-panel",
    "Every row in the file",
    plural(names.total, "row", "rows") + " uploaded · how each one was treated",
    "layers"
  );
  var bar = el("div", "segbar");
  bar.setAttribute("role", "img");
  var aria = [];
  var legend = el("ul", "seg-legend");
  var i;
  for (i = 0; i < parts.length; i += 1) {
    var part = parts[i];
    var count = part.list.length;
    if (count === 0) {
      continue;
    }
    aria.push(part.label + " " + count);
    var seg = el("span", "seg seg-" + part.key);
    seg.style.flexGrow = String(count);
    seg.style.setProperty("--i", i);
    seg.setAttribute("data-tip", part.label + ": " + part.list.join(", "));
    seg.appendChild(el("span", "seg-num", String(count)));
    bar.appendChild(seg);

    var li = el("li", "seg-item");
    li.appendChild(el("span", "swatch seg-" + part.key));
    var text = el("span", "seg-text");
    var head = el("span", "seg-head");
    head.appendChild(el("strong", null, part.label));
    head.appendChild(el("span", "seg-count", String(count)));
    text.appendChild(head);
    text.appendChild(el("span", "seg-detail", part.detail));
    text.appendChild(el("span", "seg-names", part.list.join(", ")));
    li.appendChild(text);
    legend.appendChild(li);
  }
  bar.setAttribute("aria-label", "Rows in the file: " + aria.join(", "));
  section.appendChild(bar);
  section.appendChild(legend);
  addText(section, "Only counted rows are compared with the approved intake.", "panel-foot");
  return section;
}

function reviewPanel(findings) {
  var section = panel(
    "review-panel",
    "Human review queue",
    "A person decides every case. Nothing is auto-rejected.",
    "person"
  );
  var list = el("ul", "queue");
  var i;
  for (i = 0; i < findings.review.length; i += 1) {
    var item = findings.review[i];
    var li = el("li", "queue-item");
    var head = el("div", "queue-head");
    head.appendChild(el("span", "queue-name", item.subject));
    head.appendChild(el("span", "code-tag", item.code));
    li.appendChild(head);
    li.appendChild(el("p", "queue-note", item.note));
    var foot = el("div", "queue-foot");
    if (item.confidence !== null) {
      scoreMeter(foot, item.confidence);
    }
    foot.appendChild(el("span", "decision", "In review"));
    li.appendChild(foot);
    list.appendChild(li);
  }
  section.appendChild(list);
  var link = el("a", "panel-link");
  link.href = "review.html";
  link.appendChild(el("span", null, "Open review queue"));
  link.appendChild(icon("arrow"));
  section.appendChild(link);
  return section;
}

function reasonPanel(findings) {
  var section = panel(
    "reason-panel",
    "Reason codes",
    "Select a code to list who it applies to",
    "tag"
  );
  var chips = el("div", "chips");
  var groups = reasonGroups(findings);
  var c;
  for (c = 0; c < groups.length; c += 1) {
    var group = groups[c];
    var kind = REASON_KIND[group.code] || { kind: "data", label: "" };
    var block = el("div", "chip-block kind-" + kind.kind);
    block.style.setProperty("--i", c);
    var chip = el("button", "chip");
    chip.type = "button";
    chip.setAttribute("aria-expanded", "false");
    var chipTop = el("span", "chip-top");
    chipTop.appendChild(el("span", "chip-code", group.code));
    chipTop.appendChild(el("span", "chip-count", String(group.subjects.length)));
    chip.appendChild(chipTop);
    chip.appendChild(el("span", "chip-kind", kind.label));
    var where = [];
    if (group.onReport) {
      where.push("Report");
    }
    if (group.inReview) {
      where.push("Review queue");
    }
    chip.appendChild(el("span", "chip-where", where.length ? "Shown on: " + where.join(" + ") : "Not raised"));

    var detail = el("div", "chip-detail");
    detail.hidden = true;
    var subjectList = el("ul", "chip-subjects");
    var j;
    for (j = 0; j < group.subjects.length; j += 1) {
      subjectList.appendChild(el("li", null, group.subjects[j]));
    }
    detail.appendChild(subjectList);
    if (group.message) {
      addText(detail, group.message, "message");
    }
    if (group.fix) {
      addText(detail, "Fix: " + group.fix, "fix");
    }
    chip.addEventListener("click", function (panelEl, button) {
      return function () {
        panelEl.hidden = !panelEl.hidden;
        button.setAttribute("aria-expanded", panelEl.hidden ? "false" : "true");
      };
    }(detail, chip));
    block.appendChild(chip);
    block.appendChild(detail);
    chips.appendChild(block);
  }
  section.appendChild(chips);

  var kinds = el("ul", "kind-legend");
  var rows = [
    ["data", "Institution fixes the row", "fix shown on the Report"],
    ["seat", "Course over approved intake", "flag sits on the course"],
    ["person", "A person decides", "case goes to the Review queue"]
  ];
  var k;
  for (k = 0; k < rows.length; k += 1) {
    var li = el("li", "kind-" + rows[k][0]);
    li.appendChild(el("span", "kind-dot"));
    li.appendChild(el("strong", null, rows[k][1]));
    li.appendChild(el("span", null, rows[k][2]));
    kinds.appendChild(li);
  }
  section.appendChild(kinds);
  return section;
}

function scopePanel() {
  var section = el("section", "scope");
  var cols = [
    ["is-built", "In this prototype", "Validation report, human review queue and this dashboard"],
    ["is-sim", "Simulated", "APAAR registry lookup and every student record (synthetic data)"],
    ["is-proposed", "Proposed, not yet built", "Consent-based verification, audit log, role-based access, live APAAR and DigiLocker"]
  ];
  var i;
  for (i = 0; i < cols.length; i += 1) {
    var col = el("div", "scope-col " + cols[i][0]);
    col.appendChild(el("p", "scope-title", cols[i][1]));
    col.appendChild(el("p", "scope-text", cols[i][2]));
    section.appendChild(col);
  }
  return section;
}

function renderDashboard(findings) {
  var screen = document.getElementById("screen");
  var dash = findings.dashboard;
  var names = enrolmentNames();
  var over = names.counted.length - dash.approvedIntake;
  var flagged = dash.status === "Flagged";

  contextBar(screen, dash, true);

  var stats = el("div", "stats stat-row");
  stats.appendChild(statCard({
    index: 0, tone: "navy", icon: "seat",
    label: "Approved intake",
    value: String(dash.approvedIntake),
    caption: "Regular seats approved for this course"
  }));
  stats.appendChild(statCard({
    index: 1, tone: "blue", icon: "check",
    label: "Counted",
    value: String(names.counted.length),
    caption: "Regular enrolment · valid ID, one row each",
    delta: over > 0 ? over + " above approved intake" : null,
    names: names.counted
  }));
  stats.appendChild(statCard({
    index: 2, tone: "amber", icon: "hold",
    label: "Held",
    value: String(names.held.length),
    caption: "Regular enrolment · held until the ID is fixed",
    names: names.held
  }));
  stats.appendChild(statCard({
    index: 3, tone: flagged ? "red" : "green", icon: flagged ? "flag" : "check",
    label: "Institution status",
    value: dash.status,
    flagged: flagged,
    caption: flagged ? "A course is over its approved intake" : "No course over its approved intake"
  }));
  stats.appendChild(statCard({
    index: 4, tone: "blue", icon: "person",
    label: "Still in review",
    value: String(dash.stillInReview),
    caption: "Waiting for a person to decide"
  }));
  screen.appendChild(stats);

  var gridTop = el("div", "dash-grid");
  gridTop.appendChild(seatPanel(dash, names));
  gridTop.appendChild(rowsPanel(names));
  screen.appendChild(gridTop);

  var gridBottom = el("div", "dash-grid dash-grid-b");
  gridBottom.appendChild(reasonPanel(findings));
  gridBottom.appendChild(reviewPanel(findings));
  screen.appendChild(gridBottom);

  screen.appendChild(scopePanel());
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
