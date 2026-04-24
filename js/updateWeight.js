export function updateWeight(graph, edgeId, newWeight) {
  const edge = graph.edges.find((item) => item.id === Number(edgeId));

  if (!edge) {
    throw new Error("Edge not found.");
  }

  if (!Number.isFinite(newWeight)) {
    throw new Error("Weight must be a valid number.");
  }

  edge.weight = newWeight;
  return edge;
}
