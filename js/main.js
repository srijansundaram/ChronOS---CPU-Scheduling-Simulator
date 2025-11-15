const state = {
  processes: [],
  algorithm: "FCFS",
  quantum: 2,
  multi: false,
  showIdle: true,
};

// ---------- UI Helpers ----------
function refreshTable() {
  const tbody = document.querySelector("#procTable tbody");
  tbody.innerHTML = "";

  state.processes.forEach((p, idx) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${p.pid}</td>
      <td>${p.arrival}</td>
      <td>${p.burst}</td>
      <td>${p.priority ?? "-"}</td>
      <td>
        <span class="action-icon" data-act="edit">✏️</span>
        <span class="action-icon" data-act="del">🗑️</span>
      </td>
    `;

    // Delete process
    row.querySelector('[data-act="del"]').onclick = () => {
      state.processes.splice(idx, 1);
      refreshTable();
      logChange(`Deleted process ${p.pid}`);
    };

    // Edit process
    row.querySelector('[data-act="edit"]').onclick = () => {
      document.querySelector("#pid").value = p.pid;
      document.querySelector("#arrival").value = p.arrival;
      document.querySelector("#burst").value = p.burst;
      document.querySelector("#priority").value = p.priority ?? 0;
      state.processes.splice(idx, 1);
      refreshTable();
      logChange(`Editing process ${p.pid}`);
    };

    tbody.appendChild(row);
  });
}

function logChange(msg) {
  const ul = document.querySelector("#changelogList");
  const li = document.createElement("li");
  li.textContent = `${new Date().toISOString().slice(0, 10)} — ${msg}`;
  ul.prepend(li);
}

// ---------- Simulation ----------
function runSelected() {
  const A = window.Scheduler;
  const procs = structuredClone(state.processes).sort(
    (a, b) => a.arrival - b.arrival
  );
  if (!procs.length) return toast("Add at least one process.");

  let result;
  switch (state.algorithm) {
    case "FCFS":
      result = A.fcfs(procs);
      break;
    case "SJF_NON":
      result = A.sjfNonPreemptive(procs);
      break;
    case "SJF_PRE":
      result = A.sjfPreemptive(procs);
      break;
    case "PRIORITY":
      result = A.priorityScheduling(procs);
      break;
    case "RR":
      result = A.roundRobin(procs, state.quantum);
      break;
  }

  const timeline = result.timeline;
  const resultMetrics = Metrics.computeMetrics(timeline, procs);

  // Render visuals
  Viz.renderGantt("#ganttContainer", timeline, state.showIdle);
  Viz.renderQueue(
    "#queueContainer",
    procs.map((p) => p.pid)
  );
  Viz.renderMetrics("#metricsGrid", resultMetrics);

  // 🔥 Corrected comparison chart structure
  Viz.renderPerfChart("#perfChart", [
    { name: state.algorithm, metrics: resultMetrics },
  ]);

  // Multi-core view
  if (state.multi) {
    const { cpu1, cpu2 } = A.splitForMulticore(timeline);
    document.querySelector("#ganttContainer2").classList.remove("hidden");
    Viz.renderGantt("#ganttContainer2", cpu2, state.showIdle);
  } else {
    document.querySelector("#ganttContainer2").classList.add("hidden");
  }

  // Export binding
  document.querySelector("#exportBtn").onclick = () =>
    Report.exportReport(state.algorithm, procs, timeline, resultMetrics);

  logChange(`Ran ${state.algorithm} on ${procs.length} processes`);
}

function runCompare() {
  const procs = structuredClone(state.processes).sort(
    (a, b) => a.arrival - b.arrival
  );
  if (!procs.length) return toast("Add at least one process.");

  const runs = Compare.compareAllAlgorithms(
    procs,
    state.quantum,
    state.showIdle
  );
  const current = runs.find((r) => r.name === state.algorithm) || runs[0];

  Viz.renderGantt("#ganttContainer", current.timeline, state.showIdle);
  Viz.renderQueue(
    "#queueContainer",
    procs.map((p) => p.pid)
  );
  Viz.renderMetrics("#metricsGrid", current.metrics);
  Viz.renderPerfChart("#perfChart", runs);

  document.querySelector("#ganttContainer2").classList.add("hidden");
  logChange("Compared all algorithms");
}

// ---------- Reset ----------
function resetAll() {
  state.processes = [];
  refreshTable();
  Viz.renderGantt("#ganttContainer", [], true);
  document.querySelector("#ganttContainer2").classList.add("hidden");
  document.querySelector("#queueContainer").innerHTML = "";
  document.querySelector("#metricsGrid").innerHTML = "";
  document.querySelector("#perfChart").innerHTML = "";
  logChange("Reset project");
}

// ---------- Initialization ----------
window.addEventListener("DOMContentLoaded", () => {
  // Theme toggle
  document.querySelector("#themeToggle").onclick = () => {
    document.body.classList.toggle("theme-light");
    document.body.classList.toggle("theme-dark");
  };

  // Process form
  document.querySelector("#processForm").addEventListener("submit", (e) => {
    e.preventDefault();
    const pid =
      document.querySelector("#pid").value.trim() ||
      `P${state.processes.length + 1}`;
    const arrival = +document.querySelector("#arrival").value;
    const burst = +document.querySelector("#burst").value;
    const priority = +document.querySelector("#priority").value || 0;

    state.processes.push({ pid, arrival, burst, priority });
    refreshTable();
    e.target.reset();
    document.querySelector("#arrival").value = 0;
    document.querySelector("#burst").value = 5;
    document.querySelector("#priority").value = 0;
    document.querySelector("#pid").focus();

    logChange(`Added process ${pid}`);
  });

  // Control bindings
  document.querySelector("#algoSelect").onchange = (e) => {
    state.algorithm = e.target.value;
    document.querySelector("#qWrap").style.display =
      state.algorithm === "RR" ? "flex" : "none";
  };

  document.querySelector("#quantum").oninput = (e) => {
    state.quantum = +e.target.value || 2;
  };

  document.querySelector("#multiCore").onchange = (e) => {
    state.multi = e.target.checked;
  };

  document.querySelector("#showIdle").onchange = (e) => {
    state.showIdle = e.target.checked;
  };

  // Button actions
  document.querySelector("#runBtn").onclick = runSelected;
  document.querySelector("#compareBtn").onclick = runCompare;
  document.querySelector("#resetBtn").onclick = resetAll;

  // Init message
  logChange("ChronOS initialized successfully");
});
