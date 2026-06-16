function bfsSteps(start, end) {
  const visited = new Set([start]);
  const queue = [
    {
      node: start,
      path: [start],
      cost: 0,
      parent: null,
    },
  ];

  const steps = [{ type: 'start', node: start }];

  while (queue.length) {
    const current = queue.shift();

    steps.push({
      type: 'visit',
      node: current.node,
      from: current.parent,
      path: [...current.path],
      cost: current.cost,
      queueLen: queue.length,
    });

    if (current.node === end) {
      steps.push({
        type: 'found',
        path: [...current.path],
        cost: Number(current.cost.toFixed(2)),
      });

      return steps;
    }

    for (const { to, w } of adj[current.node]) {
      if (visited.has(to)) continue;

      visited.add(to);

      queue.push({
        node: to,
        path: [...current.path, to],
        cost: current.cost + w,
        parent: current.node,
      });

      steps.push({
        type: 'enqueue',
        node: to,
        from: current.node,
        queueLen: queue.length,
      });
    }
  }

  return steps;
}
