const clone = (x) => JSON.parse(JSON.stringify(x));

// ---------- FCFS ----------
function fcfs(processes) {
  const procs = clone(processes).sort((a, b) => a.arrival - b.arrival);
  let t = 0,
    idle = 0,
    ctx = 0;
  const timeline = [];

  for (const p of procs) {
    if (t < p.arrival) {
      timeline.push({ pid: "IDLE", start: t, end: p.arrival });
      idle += p.arrival - t;
      t = p.arrival;
    }
    timeline.push({ pid: p.pid, start: t, end: t + p.burst });
    ctx++;
    t += p.burst;
  }

  return { timeline, contextSwitches: ctx - 1, idleTime: idle };
}

// ---------- SJF (Non-Preemptive) ----------
function sjfNonPreemptive(processes) {
  const procs = clone(processes).sort((a, b) => a.arrival - b.arrival);
  const ready = [];
  let i = 0,
    t = 0,
    idle = 0,
    ctx = 0;
  const timeline = [];

  while (i < procs.length || ready.length) {
    while (i < procs.length && procs[i].arrival <= t) ready.push(procs[i++]);
    if (!ready.length) {
      const next = procs[i];
      timeline.push({ pid: "IDLE", start: t, end: next.arrival });
      idle += next.arrival - t;
      t = next.arrival;
      continue;
    }

    ready.sort((a, b) => a.burst - b.burst);
    const p = ready.shift();
    timeline.push({ pid: p.pid, start: t, end: t + p.burst });
    ctx++;
    t += p.burst;
  }

  return { timeline, contextSwitches: ctx - 1, idleTime: idle };
}

// ---------- SJF (Preemptive) ----------
function sjfPreemptive(processes) {
  const procs = clone(processes).map((p) => ({ ...p, rem: p.burst }));
  const sorted = clone(procs).sort((a, b) => a.arrival - b.arrival);
  const timeline = [];
  let t = 0,
    i = 0,
    cur = null,
    idle = 0,
    ctx = 0;

  const pushIdle = (until) => {
    if (t < until) {
      timeline.push({ pid: "IDLE", start: t, end: until });
      idle += until - t;
      t = until;
    }
  };

  while (i < sorted.length || procs.some((p) => p.rem > 0)) {
    while (i < sorted.length && sorted[i].arrival <= t) i++;
    const ready = procs.filter((p) => p.arrival <= t && p.rem > 0);

    if (!ready.length) {
      const next = sorted[i];
      if (!next) break;
      pushIdle(next.arrival);
      continue;
    }

    ready.sort((a, b) => a.rem - b.rem);
    const selected = ready[0];

    if (!cur || cur.pid !== selected.pid) {
      if (cur && cur.start < t)
        timeline.push({ pid: cur.pid, start: cur.start, end: t });
      cur = { pid: selected.pid, start: t };
      ctx++;
    }

    selected.rem--;
    t++;

    if (selected.rem === 0) {
      timeline.push({ pid: selected.pid, start: cur.start, end: t });
      cur = null;
    }
  }

  return {
    timeline: mergeContinuous(timeline),
    contextSwitches: ctx - 1,
    idleTime: idle,
  };
}

// ---------- Priority Scheduling ----------
function priorityScheduling(processes) {
  const procs = clone(processes).sort((a, b) => a.arrival - b.arrival);
  const ready = [];
  const timeline = [];
  let i = 0,
    t = 0,
    idle = 0,
    ctx = 0;

  while (i < procs.length || ready.length) {
    while (i < procs.length && procs[i].arrival <= t) ready.push(procs[i++]);
    if (!ready.length) {
      const next = procs[i];
      timeline.push({ pid: "IDLE", start: t, end: next.arrival });
      idle += next.arrival - t;
      t = next.arrival;
      continue;
    }

    ready.sort((a, b) => a.priority - b.priority || a.arrival - b.arrival);
    const p = ready.shift();
    timeline.push({ pid: p.pid, start: t, end: t + p.burst });
    ctx++;
    t += p.burst;
  }

  return { timeline, contextSwitches: ctx - 1, idleTime: idle };
}

// ---------- Round Robin ----------
function roundRobin(processes, q = 2) {
  const procs = clone(processes)
    .map((p) => ({ ...p, rem: p.burst }))
    .sort((a, b) => a.arrival - b.arrival);

  const ready = [];
  const timeline = [];
  let t = 0,
    i = 0,
    idle = 0,
    ctx = 0;

  const enqueue = () => {
    while (i < procs.length && procs[i].arrival <= t) ready.push(procs[i++]);
  };

  while (i < procs.length || ready.length) {
    enqueue();
    if (!ready.length) {
      const next = procs[i];
      timeline.push({ pid: "IDLE", start: t, end: next.arrival });
      idle += next.arrival - t;
      t = next.arrival;
      enqueue();
      continue;
    }

    const p = ready.shift();
    ctx++;
    const run = Math.min(q, p.rem);
    timeline.push({ pid: p.pid, start: t, end: t + run });
    t += run;
    p.rem -= run;
    enqueue();

    if (p.rem > 0) {
      p.arrival = t;
      ready.push(p);
    }
  }

  return {
    timeline: mergeContinuous(timeline),
    contextSwitches: ctx - 1,
    idleTime: idle,
  };
}

// ---------- Helper ----------
function mergeContinuous(timeline) {
  if (!timeline.length) return timeline;
  const merged = [timeline[0]];
  for (let i = 1; i < timeline.length; i++) {
    const prev = merged[merged.length - 1];
    const curr = timeline[i];
    if (prev.pid === curr.pid && prev.end === curr.start) {
      prev.end = curr.end;
    } else {
      merged.push(curr);
    }
  }
  return merged;
}

// ---------- Multi-Core Split ----------
function splitForMulticore(timeline) {
  const cpu1 = [],
    cpu2 = [];
  let t1 = 0,
    t2 = 0;

  for (const seg of timeline) {
    if (seg.pid === "IDLE") {
      cpu1.push({ ...seg });
      cpu2.push({ ...seg });
      t1 = Math.max(t1, seg.end);
      t2 = Math.max(t2, seg.end);
      continue;
    }
    if (t1 <= t2) {
      cpu1.push(seg);
      t1 = seg.end;
    } else {
      cpu2.push(seg);
      t2 = seg.end;
    }
  }

  return { cpu1, cpu2 };
}

// Export
window.Scheduler = {
  fcfs,
  sjfNonPreemptive,
  sjfPreemptive,
  priorityScheduling,
  roundRobin,
  splitForMulticore,
};
