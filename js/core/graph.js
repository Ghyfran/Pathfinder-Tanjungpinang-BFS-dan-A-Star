const adj = {};

NODES.forEach((node) => {
  adj[node.id] = [];
});

EDGES.forEach(([from, to, weight]) => {
  adj[from].push({ to, w: weight });
  adj[to].push({ to: from, w: weight });
});
