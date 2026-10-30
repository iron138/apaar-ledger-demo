// Optional walkthrough. It stays off until "Play auto demo" or index.html?demo=run.
// The run flag, step and speed travel in the URL only. This file stores nothing.

var demoToken = 0;
var demoTimers = [];
var demoPaused = false;
var pausedQueue = [];
var demoSpeed = 1;
var demoIndex = 0;
var demoActive = false;

// URL step numbers are positions in this list, starting at 0.
var DEMO_STEPS = [
  {
    page: "index.html",
    selector: ".banner",
    text: "Prototype",
    caption: "Working prototype on synthetic sample data. The APAAR registry here is simulated.",
    wait: 5060
  },
  {
    page: "index.html",
    selector: ".card",
    text: "APAAR-FORMAT",
    caption: "Each problem gets a reason code, a plain message and a suggested fix. This ID is not 12 digits, so the row is held.",
    wait: 5680
  },
  {
    page: "index.html",
    selector: ".card",
    text: "DUP-IN-FILE",
    caption: "The same APAAR ID appears on two rows of the file.",
    wait: 3250
  },
  {
    page: "index.html",
    selector: ".card",
    text: "OVER-INTAKE",
    caption: "The course would have 3 regular claims against an approved intake of 2. The flag sits on the course, not on a student.",
    wait: 5770
  },
  {
    page: "index.html",
    selector: ".card",
    text: "DUAL-ENROL",
    caption: "One student appears at two institutions. The ledger does not reject them. It sends the case to a person.",
    wait: 4790
  },
  {
    page: "review.html",
    selector: ".card",
    text: "Meera Iyer",
    caption: "Exact ID match. Shown with an illustrative score of 0.95. A person decides.",
    wait: 5750,
    clickLabel: "Accept",
    clickAt: 4300
  },
  {
    page: "review.html",
    selector: ".card",
    text: "Sana Qureshi",
    caption: "No APAAR ID. Similar name and the same date of birth, illustrative score 0.62. A student without an ID goes to review, never auto-rejected.",
    wait: 7090,
    clickLabel: "Send back",
    clickAt: 6300
  },
  {
    page: "dashboard.html",
    selector: ".stat-row",
    caption: "Approved intake 2. Regular enrolment: 3 counted, 1 held. The institution is flagged. Items are still in review.",
    wait: 6580,
    clickSelector: ".stat",
    clickText: "Counted",
    clickAt: 3000,
    clickAgainAtEnd: true
  },
  {
    page: "dashboard.html",
    selector: ".seat-bar",
    caption: "The seat bar shows the course over its approved intake by one.",
    wait: 3090
  },
  {
    page: "dashboard.html",
    selector: "button.chip",
    text: "OVER-INTAKE",
    caption: "Each reason code shows how many cases it covers. Select one to list who it applies to.",
    wait: 4310,
    clickSelf: true,
    clickAt: 2400,
    clickAgainAtEnd: true
  },
  {
    page: "dashboard.html",
    selector: ".banner",
    text: "Prototype",
    caption: "Registry lookup is simulated. Consent and the audit log are proposed, not yet built. A person decides every uncertain case.",
    wait: 7250
  },
  {
    page: "dashboard.html",
    caption: "End of prototype demo. Synthetic data.",
    wait: 3000,
    replay: true
  }
];

function queryParam(name) {
  var search = window.location.search || "";
  if (search.charAt(0) === "?") {
    search = search.substring(1);
  }
  if (!search) {
    return "";
  }
  var parts = search.split("&");
  var i;
  for (i = 0; i < parts.length; i += 1) {
    var bits = parts[i].split("=");
    var key = decodeURIComponent(bits[0] || "");
    if (key === name) {
      return decodeURIComponent(bits.slice(1).join("=") || "");
    }
  }
  return "";
}

function pageName() {
  var page = "";
  if (document.body && document.body.getAttribute) {
    page = document.body.getAttribute("data-page") || "";
  }
  if (page === "review") {
    return "review.html";
  }
  if (page === "dashboard") {
    return "dashboard.html";
  }
  if (page === "report") {
    return "index.html";
  }
  var path = window.location.pathname || "";
  if (path.indexOf("review.html") !== -1) {
    return "review.html";
  }
  if (path.indexOf("dashboard.html") !== -1) {
    return "dashboard.html";
  }
  return "index.html";
}

function readStep() {
  var raw = queryParam("step");
  if (raw === "") {
    return 0;
  }
  var n = parseInt(raw, 10);
  if (isNaN(n)) {
    return 0;
  }
  return n;
}

function readSpeed() {
  var n = parseFloat(queryParam("speed"));
  if (n === 0.75 || n === 1 || n === 1.5) {
    return n;
  }
  return 1;
}

function scaled(ms) {
  var speed = demoSpeed;
  if (!(speed > 0)) {
    speed = 1;
  }
  return ms / speed;
}

// Old timers check this token and do nothing after Pause, Skip, Restart or Stop.
function bumpToken() {
  demoToken += 1;
  clearTimers();
}

function clearTimers() {
  var i;
  for (i = 0; i < demoTimers.length; i += 1) {
    clearTimeout(demoTimers[i].id);
  }
  demoTimers = [];
}

function scheduleReal(realMs, fn) {
  var token = demoToken;
  var wait = realMs;
  if (wait < 0) {
    wait = 0;
  }
  var id = setTimeout(function () {
    if (token !== demoToken) {
      return;
    }
    try {
      fn();
    } catch (err) {
      // A missing control must not break the page.
    }
  }, wait);
  demoTimers.push({
    id: id,
    at: Date.now() + wait,
    fn: fn
  });
}

function later(ms, fn) {
  scheduleReal(scaled(ms), fn);
}

function findByText(selector, text) {
  try {
    var nodes = document.querySelectorAll(selector);
    var needle = text || "";
    var i;
    for (i = 0; i < nodes.length; i += 1) {
      var content = nodes[i].textContent || "";
      if (content.indexOf(needle) !== -1) {
        return nodes[i];
      }
    }
  } catch (err) {
    return null;
  }
  return null;
}

// The dashboard row is .stats. The step asks for .stat-row, so use that when it exists.
function findTarget(step) {
  if (!step || !step.selector) {
    return null;
  }
  var found = findByText(step.selector, step.text || "");
  if (!found && step.selector === ".stat-row") {
    found = findByText(".stats", "");
  }
  return found;
}

function clearHighlight() {
  var nodes;
  try {
    nodes = document.querySelectorAll(".demo-highlight");
  } catch (err) {
    return;
  }
  var i;
  for (i = 0; i < nodes.length; i += 1) {
    if (nodes[i].classList) {
      nodes[i].classList.remove("demo-highlight");
    }
  }
}

function highlight(node) {
  clearHighlight();
  if (!node || !node.classList) {
    return;
  }
  node.classList.add("demo-highlight");
  try {
    node.scrollIntoView({ behavior: "smooth", block: "center" });
  } catch (err) {
    try {
      node.scrollIntoView();
    } catch (err2) {
      // Scrolling is optional.
    }
  }
}

function showCaption(text) {
  var box = document.getElementById("demo-caption");
  if (!box) {
    box = document.createElement("p");
    box.id = "demo-caption";
    box.className = "demo-caption";
    document.body.appendChild(box);
  }
  box.textContent = text;
}

function safeClick(node) {
  if (!node || typeof node.click !== "function") {
    return;
  }
  try {
    node.click();
  } catch (err) {
    // Ignore a control that cannot be clicked.
  }
}

function clickNamed(root, label) {
  if (!root || !root.getElementsByTagName) {
    return;
  }
  var buttons = root.getElementsByTagName("button");
  var i;
  for (i = 0; i < buttons.length; i += 1) {
    if ((buttons[i].textContent || "").indexOf(label) !== -1) {
      safeClick(buttons[i]);
      return;
    }
  }
}

function setPauseLabel() {
  var button = document.getElementById("demo-pause");
  if (button) {
    button.textContent = demoPaused ? "Resume" : "Pause";
  }
}

function pauseDemo() {
  if (!demoActive || demoPaused) {
    return;
  }
  var now = Date.now();
  var kept = [];
  var i;
  for (i = 0; i < demoTimers.length; i += 1) {
    clearTimeout(demoTimers[i].id);
    kept.push({
      remain: Math.max(0, demoTimers[i].at - now),
      fn: demoTimers[i].fn
    });
  }
  demoTimers = [];
  demoToken += 1;
  pausedQueue = kept;
  demoPaused = true;
  setPauseLabel();
}

function resumeDemo() {
  if (!demoActive || !demoPaused) {
    return;
  }
  demoPaused = false;
  demoToken += 1;
  var queue = pausedQueue;
  pausedQueue = [];
  var i;
  for (i = 0; i < queue.length; i += 1) {
    scheduleReal(queue[i].remain, queue[i].fn);
  }
  setPauseLabel();
}

function goTo(page, step) {
  bumpToken();
  window.location.href = page + "?demo=run&step=" + step + "&speed=" + demoSpeed;
}

function restartDemo() {
  bumpToken();
  window.location.href = "index.html?demo=run&step=0&speed=" + demoSpeed;
}

function stopDemo() {
  demoActive = false;
  demoPaused = false;
  pausedQueue = [];
  bumpToken();
  clearHighlight();
  window.location.href = pageName();
}

function showReplay() {
  var replay = document.getElementById("demo-replay");
  if (replay) {
    replay.hidden = false;
  }
}

function clickStepTarget(step, target) {
  if (step.clickLabel) {
    clickNamed(target, step.clickLabel);
    return;
  }
  if (step.clickSelector) {
    safeClick(findByText(step.clickSelector, step.clickText || ""));
    return;
  }
  if (step.clickSelf) {
    safeClick(target || findTarget(step));
  }
}

function advance(index) {
  clearHighlight();
  var next = index + 1;
  if (next >= DEMO_STEPS.length) {
    return;
  }
  var step = DEMO_STEPS[next];
  if (step.page !== pageName()) {
    goTo(step.page, next);
    return;
  }
  runStep(next);
}

function runStep(index) {
  var step = DEMO_STEPS[index];
  if (!step) {
    return;
  }
  demoIndex = index;
  try {
    clearHighlight();
    showCaption(step.caption);
    if (step.replay) {
      showReplay();
    }
    var target = findTarget(step);
    if (target) {
      highlight(target);
    }
    if (step.clickAt) {
      later(step.clickAt, function () {
        clickStepTarget(step, target);
      });
    }
    later(step.wait, function () {
      if (step.clickAgainAtEnd) {
        clickStepTarget(step, target);
      }
      if (step.replay) {
        return;
      }
      advance(index);
    });
  } catch (err) {
    // Keep the caption up even if a highlight cannot be drawn.
  }
}

function skipStep() {
  if (!demoActive) {
    return;
  }
  demoPaused = false;
  pausedQueue = [];
  setPauseLabel();
  bumpToken();
  clearHighlight();
  var next = demoIndex + 1;
  if (next >= DEMO_STEPS.length) {
    return;
  }
  var step = DEMO_STEPS[next];
  if (step.page !== pageName()) {
    goTo(step.page, next);
    return;
  }
  runStep(next);
}

function toggleControls() {
  var bar = document.getElementById("demo-controls");
  if (!bar || !bar.classList) {
    return;
  }
  bar.classList.toggle("demo-controls-hidden");
}

function speedChoice(value) {
  var select = document.createElement("select");
  select.id = "demo-speed";
  var speeds = ["0.75", "1", "1.5"];
  var labels = ["0.75x", "1x", "1.5x"];
  var i;
  for (i = 0; i < speeds.length; i += 1) {
    var option = document.createElement("option");
    option.value = speeds[i];
    option.textContent = labels[i];
    if (parseFloat(speeds[i]) === value) {
      option.selected = true;
    }
    select.appendChild(option);
  }
  select.addEventListener("change", function () {
    var next = parseFloat(select.value);
    if (next === 0.75 || next === 1 || next === 1.5) {
      demoSpeed = next;
    }
  });
  return select;
}

function controlButton(id, label, onClick) {
  var button = document.createElement("button");
  button.type = "button";
  button.id = id;
  button.textContent = label;
  button.addEventListener("click", onClick);
  return button;
}

function buildControls() {
  if (document.getElementById("demo-controls")) {
    return;
  }
  var bar = document.createElement("div");
  bar.id = "demo-controls";
  bar.className = "demo-controls";
  bar.appendChild(controlButton("demo-pause", "Pause", function () {
    if (demoPaused) {
      resumeDemo();
    } else {
      pauseDemo();
    }
  }));
  bar.appendChild(controlButton("demo-skip", "Skip step", skipStep));
  bar.appendChild(controlButton("demo-restart", "Restart", restartDemo));
  bar.appendChild(controlButton("demo-stop", "Stop", stopDemo));
  bar.appendChild(speedChoice(demoSpeed));
  var replay = controlButton("demo-replay", "Replay", restartDemo);
  replay.hidden = true;
  bar.appendChild(replay);
  document.body.appendChild(bar);
}

function addPlayButton() {
  if (document.getElementById("demo-play")) {
    return;
  }
  var button = document.createElement("button");
  button.type = "button";
  button.id = "demo-play";
  button.className = "demo-play";
  button.textContent = "Play auto demo";
  button.addEventListener("click", function () {
    window.location.href = "index.html?demo=run&step=0&speed=1";
  });
  document.body.appendChild(button);
}

function whenReady(fn) {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", fn);
  } else {
    fn();
  }
}

function onKey(event) {
  if (!demoActive || event.repeat) {
    return;
  }
  var key = event.key;
  if (key === "Escape") {
    event.preventDefault();
    stopDemo();
    return;
  }
  if (key === "h" || key === "H") {
    event.preventDefault();
    toggleControls();
    return;
  }
  if (key === " " || key === "Spacebar") {
    if (event.target && event.target.tagName === "SELECT") {
      return;
    }
    event.preventDefault();
    if (demoPaused) {
      resumeDemo();
    } else {
      pauseDemo();
    }
  }
}

function bootDemo() {
  if (queryParam("demo") !== "run") {
    addPlayButton();
    return;
  }
  demoActive = true;
  demoSpeed = readSpeed();
  buildControls();
  var index = readStep();
  if (index < 0 || index >= DEMO_STEPS.length) {
    index = 0;
  }
  if (DEMO_STEPS[index].page !== pageName()) {
    goTo(DEMO_STEPS[index].page, index);
    return;
  }
  demoIndex = index;
  whenReady(function () {
    later(600, function () {
      runStep(index);
    });
  });
}

document.addEventListener("keydown", onKey);
bootDemo();
