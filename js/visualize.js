const COLORS = d3.scaleOrdinal(d3.schemeTableau10);

// ---------- Gantt Chart ----------
function renderGantt(containerId, timeline, showIdle = true) {
  const wrap = d3.select(containerId);
  wrap.selectAll("*").remove();

  if (!timeline.length) return;

  const w = wrap.node().clientWidth - 16;
  const h = wrap.node().clientHeight - 16;
  const svg = wrap.append("svg").attr("width", w).attr("height", h);

  const tMax = d3.max(timeline, (d) => d.end);
  const x = d3
    .scaleLinear()
    .domain([0, tMax])
    .range([40, w - 10]);
  const y = 20,
    barH = 28;

  // Axis
  svg
    .append("g")
    .attr("transform", `translate(0, ${y + barH + 10})`)
    .call(
      d3
        .axisBottom(x)
        .ticks(Math.min(tMax, 10))
        .tickSize(-barH - 20)
    )
    .selectAll("text")
    .attr("fill", "currentColor");

  // Bars
  svg
    .append("g")
    .selectAll("rect")
    .data(timeline)
    .enter()
    .append("rect")
    .attr("x", (d) => x(d.start))
    .attr("y", y)
    .attr("width", (d) => Math.max(2, x(d.end) - x(d.start)))
    .attr("height", barH)
    .attr("rx", 6)
    .attr("ry", 6)
    .attr("fill", (d) => (d.pid === "IDLE" ? "#3a3e62" : COLORS(d.pid)))
    .append("title")
    .text((d) => `${d.pid} [${d.start}–${d.end}]`);

  // Labels
  svg
    .append("g")
    .selectAll("text")
    .data(timeline.filter((d) => showIdle || d.pid !== "IDLE"))
    .enter()
    .append("text")
    .attr("x", (d) => x(d.start) + 4)
    .attr("y", y + barH / 2 + 4)
    .attr("fill", "currentColor")
    .attr("font-size", 12)
    .text((d) => d.pid);
}

// ---------- Ready Queue ----------
function renderQueue(containerId, readyList) {
  const box = document.querySelector(containerId);
  box.innerHTML = "";
  readyList.forEach((pid) => {
    const pill = document.createElement("div");
    pill.className = "q-item";
    pill.textContent = pid;
    box.appendChild(pill);
  });
}

// ---------- Metrics Display ----------
function renderMetrics(containerId, metrics) {
  const grid = document.querySelector(containerId);
  grid.innerHTML = "";

  const items = [
    ["Avg Waiting Time", metrics.avgWaitingTime],
    ["Avg Turnaround", metrics.avgTurnaroundTime],
    ["CPU Utilization %", metrics.cpuUtilization],
    ["Throughput (p/u)", metrics.throughput],
    ["Idle Time (u)", metrics.idleTime],
    ["Context Switches", metrics.contextSwitches],
  ];

  items.forEach(([label, value]) => {
    const card = document.createElement("div");
    card.className = "metric";
    card.innerHTML = `
      <div class="label">${label}</div>
      <div class="value">${value}</div>
    `;
    grid.appendChild(card);
  });
}

// ---------- Performance Chart ----------
function renderPerfChart(containerId, comp) {
  const wrap = d3.select(containerId);
  wrap.selectAll("*").remove();

  const w = wrap.node().clientWidth - 8;
  const h = wrap.node().clientHeight - 8;
  const svg = wrap.append("svg").attr("width", w).attr("height", h);

  const algos = comp.map((c) => c.name);
  const values = comp.map((c) => c.metrics.avgWaitingTime);

  const x = d3
    .scaleBand()
    .domain(algos)
    .range([50, w - 10])
    .padding(0.2);
  const y = d3
    .scaleLinear()
    .domain([0, d3.max(values) || 1])
    .nice()
    .range([h - 30, 20]);

  svg
    .append("g")
    .attr("transform", `translate(0, ${h - 30})`)
    .call(d3.axisBottom(x));

  svg.append("g").attr("transform", `translate(50, 0)`).call(d3.axisLeft(y));

  svg
    .selectAll("rect")
    .data(comp)
    .enter()
    .append("rect")
    .attr("x", (d) => x(d.name))
    .attr("y", (d) => y(d.metrics.avgWaitingTime))
    .attr("width", x.bandwidth())
    .attr("height", (d) => y(0) - y(d.metrics.avgWaitingTime))
    .attr("fill", (d, i) => COLORS(i))
    .append("title")
    .text((d) => `Avg WT: ${d.metrics.avgWaitingTime}`);
}

// ---------- Export ----------
window.Viz = {
  renderGantt,
  renderQueue,
  renderMetrics,
  renderPerfChart,
};
