// Graph data model, anomaly detection, and Kruskal MST (with Union-Find).

let edgeCounter = 0;

const graph = {
  nodes: 13,
  edges: []
};

function makeEdge(from, to, weight) {
  return { id: ++edgeCounter, from, to, weight };
}

const INITIAL_EDGES = [
  [1, 2, 4],
  [2, 3, 7],
  [1, 3, 12],
  [3, 4, 5],
  [4, 5, 9],
  [5, 6, 3],
  [6, 7, 8],
  [7, 8, 6],
  [8, 9, 11],
  [9, 10, 2],
  [10, 11, 15],
  [11, 12, 1],
  [12, 13, 10],
  [13, 1, 14],
  [5, 10, -3], // CURSED EDGE
  [3, 7, 16],
  [6, 11, 13],
];

function buildInitialEdges() {
  edgeCounter = 0;
  return INITIAL_EDGES.map(([f, t, w]) => makeEdge(f, t, w));
}

function addEdgeTo(g, edge) { g.edges.push(edge); }

function removeEdgeFrom(g, edgeId) {
  g.edges = g.edges.filter(e => e.id !== edgeId);
}

function detectAnomaly(g) {
  const result = [];
  g.edges.forEach(e => {
    if (e.weight <= 0) {
      result.push({
        edge: e,
        reason: `Weight ${e.weight} is not strictly positive. Cursed edge detected.`
      });
    }
  });
  return result;
}

function computeMST(g) {
  const cursedIds = new Set(detectAnomaly(g).map(a => a.edge.id));
  const validEdges = g.edges
    .filter(e => !cursedIds.has(e.id))
    .slice()
    .sort((a, b) => a.weight - b.weight);

  const parent = {};
  for (let i = 1; i <= g.nodes; i++) parent[i] = i;

  function find(x) {
    if (parent[x] !== x) parent[x] = find(parent[x]);
    return parent[x];
  }

  function union(x, y) {
    const px = find(x), py = find(y);
    if (px === py) return false;
    parent[px] = py;
    return true;
  }

  const mst = [];
  for (const e of validEdges) {
    if (union(e.from, e.to)) {
      mst.push(e);
      if (mst.length === g.nodes - 1) break;
    }
  }
  return mst;
}

graph.edges = buildInitialEdges();
