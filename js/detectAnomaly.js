export function detectAnomaly(graph) {
  return graph.edges
    .filter((edge) => edge.weight <= 0)
    .map((edge) => ({
      edge,
      reason: `Weight ${edge.weight} is not strictly positive, so this edge is cursed.`
    }));
}
