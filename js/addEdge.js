export function addEdge(graph, edge) {
  if (!Number.isInteger(edge.from) || !Number.isInteger(edge.to)) {
    throw new Error("Nodes must be integers.");
  }

  if (edge.from < 1 || edge.from > graph.nodes || edge.to < 1 || edge.to > graph.nodes) {
    throw new Error(`Nodes must be between 1 and ${graph.nodes}.`);
  }

  if (edge.from === edge.to) {
    throw new Error("A node cannot connect to itself.");
  }

  if (!Number.isFinite(edge.weight)) {
    throw new Error("Weight must be a valid number.");
  }

  const pair = edge.from < edge.to ? `${edge.from}-${edge.to}` : `${edge.to}-${edge.from}`;
  const exists = graph.edges.some((item) => {
    const itemPair = item.from < item.to ? `${item.from}-${item.to}` : `${item.to}-${item.from}`;
    return itemPair === pair;
  });

  if (exists) {
    throw new Error("This edge already exists. Use Update Weight.");
  }

  graph.edges.push(edge);
  return edge;
}
