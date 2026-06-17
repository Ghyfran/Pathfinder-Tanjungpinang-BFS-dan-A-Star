function astarSteps(start, end) {
  const open = [
    {
      node: start,
      g: 0,
      f: heuristic(start, end),
      path: [start],
      parent: null,
    },
  ];

  const gScore = { [start]: 0 };
  const closed = new Set();
  const steps = [{ type: 'start', node: start }];

  while (open.length) {
    open.sort((a, b) => a.f - b.f);

    const current = open.shift();

    if (closed.has(current.node)) continue;

    closed.add(current.node);

    steps.push({
      type: 'visit',
      node: current.node,
      from: current.parent,
      path: [...current.path],
      cost: Number(current.g.toFixed(2)),
      fval: Number(current.f.toFixed(2)),
      openLen: open.length,
    });

    if (current.node === end) {
      steps.push({
        type: 'found',
        path: [...current.path],
        cost: Number(current.g.toFixed(2)),
      });

      return steps;
    }

    for (const { to, w } of adj[current.node]) {
      const nextG = current.g + w;

      if (gScore[to] !== undefined && nextG >= gScore[to]) continue;

      gScore[to] = nextG;

      const nextF = nextG + heuristic(to, end);

      open.push({
        node: to,
        g: nextG,
        f: nextF,
        path: [...current.path, to],
        parent: current.node,
      });

      steps.push({
        type: 'enqueue',
        node: to,
        from: current.node,
        fval: Number(nextF.toFixed(2)),
        openLen: open.length,
      });
    }
  }

  return steps;
}
