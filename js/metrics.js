function computeMetrics(timeline, processes) {
  if (!timeline.length) return {};

  const lastTime = timeline[timeline.length - 1].end;
  const procMap = new Map(
    processes.map((p) => [p.pid, { ...p, start: null, end: null }])
  );

  let idleTime = 0;
  let contextSwitches = 0;
  let prevPid = null;

  // Traverse timeline
  for (const seg of timeline) {
    if (seg.pid === "IDLE") {
      idleTime += seg.end - seg.start;
      prevPid = "IDLE";
      continue;
    }

    if (prevPid && prevPid !== seg.pid && prevPid !== "IDLE") {
      contextSwitches++;
    }

    prevPid = seg.pid;

    const p = procMap.get(seg.pid);
    if (p.start === null) p.start = seg.start;
    p.end = seg.end;
  }

  const results = [];
  let totalWT = 0,
    totalTAT = 0;

  for (const [pid, p] of procMap.entries()) {
    const completion = p.end ?? lastTime;
    const turnaround = completion - p.arrival;
    const waiting = turnaround - p.burst;

    results.push({
      pid,
      arrival: p.arrival,
      burst: p.burst,
      completion,
      turnaround,
      waiting,
    });
    totalWT += waiting;
    totalTAT += turnaround;
  }

  const avgWaitingTime = +(totalWT / processes.length).toFixed(2);
  const avgTurnaroundTime = +(totalTAT / processes.length).toFixed(2);
  const cpuUtilization = +(
    ((lastTime - idleTime) / Math.max(1, lastTime)) *
    100
  ).toFixed(2);
  const throughput = +(processes.length / Math.max(1, lastTime)).toFixed(2);

  return {
    table: results,
    avgWaitingTime,
    avgTurnaroundTime,
    cpuUtilization,
    throughput,
    idleTime,
    contextSwitches,
  };
}

// ✅ Register global
window.Metrics = { computeMetrics };
