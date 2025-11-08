function compareAllAlgorithms(processes, quantum, showIdle) {
  const runs = [];
  const A = window.Scheduler;
  const push = (name, run) =>
    runs.push({
      name,
      timeline: run.timeline,
      metrics: Metrics.computeMetrics(run.timeline, processes),
    });
  push("FCFS", A.fcfs(processes));
  push("SJF_NON", A.sjfNonPreemptive(processes));
  push("SJF_PRE", A.sjfPreemptive(processes));
  push("PRIORITY", A.priorityScheduling(processes));
  push("RR", A.roundRobin(processes, quantum));
  return runs;
}
window.Compare = { compareAllAlgorithms };
