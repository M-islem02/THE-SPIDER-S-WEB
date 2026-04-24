export function removeEdge(graph, edgeId) {
  const index = graph.edges.findIndex((edge) => edge.id === Number(edgeId));

  if (index === -1) {
    throw new Error("Edge not found.");
  }

  const [removedEdge] = graph.edges.splice(index, 1);
  return removedEdge;
}
