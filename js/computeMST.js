export function computeMST(graph) {
  const edges = graph.edges
    .filter((edge) => edge.weight > 0)
    .slice()
    .sort((a, b) => a.weight - b.weight || a.id - b.id);

  const parent = Array.from({ length: graph.nodes + 1 }, (_, index) => index);
  const rank = Array.from({ length: graph.nodes + 1 }, () => 0);

  function find(node) {
    if (parent[node] !== node) {
      parent[node] = find(parent[node]);
    }
    return parent[node];
  }

  function union(a, b) {
    const rootA = find(a);
    const rootB = find(b);

    if (rootA === rootB) {
      return false;
    }

    if (rank[rootA] < rank[rootB]) {
      parent[rootA] = rootB;
    } else if (rank[rootA] > rank[rootB]) {
      parent[rootB] = rootA;
    } else {
      parent[rootB] = rootA;
      rank[rootA] += 1;
    }

    return true;
  }

  const mstEdges = [];
  let totalWeight = 0;

  edges.forEach((edge) => {
    if (union(edge.from, edge.to)) {
      mstEdges.push(edge);
      totalWeight += edge.weight;
    }
  });

  const components = new Set();
  for (let node = 1; node <= graph.nodes; node += 1) {
    components.add(find(node));
  }

  return {
    edges: mstEdges,
    totalWeight,
    isComplete: mstEdges.length === graph.nodes - 1,
    componentCount: components.size
  };
}
