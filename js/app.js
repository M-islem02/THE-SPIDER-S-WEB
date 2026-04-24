import { addEdge } from "./addEdge.js";
import { removeEdge } from "./removeEdge.js";
import { updateWeight } from "./updateWeight.js";
import { computeMST } from "./computeMST.js";
import { detectAnomaly } from "./detectAnomaly.js";

const initialEdges = [
  { from: 1, to: 2, weight: 4 },
  { from: 2, to: 3, weight: 7 }
];

const scenarios = {
  sample: initialEdges,
  chain: [
    { from: 1, to: 2, weight: 4 },
    { from: 2, to: 3, weight: 7 },
    { from: 3, to: 4, weight: 2 },
    { from: 4, to: 5, weight: 6 },
    { from: 5, to: 6, weight: 3 },
    { from: 6, to: 7, weight: 5 },
    { from: 7, to: 8, weight: 4 },
    { from: 8, to: 9, weight: 8 },
    { from: 9, to: 10, weight: 1 },
    { from: 10, to: 11, weight: 9 },
    { from: 11, to: 12, weight: 2 },
    { from: 12, to: 13, weight: 6 }
  ],
  cursed: [
    { from: 1, to: 2, weight: 4 },
    { from: 2, to: 3, weight: 7 },
    { from: 3, to: 4, weight: -2 },
    { from: 4, to: 5, weight: 6 },
    { from: 5, to: 6, weight: 0 },
    { from: 6, to: 7, weight: 5 },
    { from: 7, to: 8, weight: 3 }
  ],
  dense: [
    { from: 1, to: 2, weight: 4 },
    { from: 2, to: 3, weight: 7 },
    { from: 1, to: 4, weight: 5 },
    { from: 2, to: 5, weight: 3 },
    { from: 3, to: 6, weight: 8 },
    { from: 4, to: 7, weight: 2 },
    { from: 5, to: 8, weight: 6 },
    { from: 6, to: 9, weight: 4 },
    { from: 7, to: 10, weight: 9 },
    { from: 8, to: 11, weight: 1 },
    { from: 9, to: 12, weight: 5 },
    { from: 10, to: 13, weight: 7 },
    { from: 11, to: 12, weight: 2 },
    { from: 12, to: 13, weight: 3 },
    { from: 5, to: 10, weight: -4 }
  ]
};

const graph = { nodes: 13, edges: [] };
const state = {
  mst: { edges: [], totalWeight: 0, isComplete: false, componentCount: 13 },
  anomalies: [],
  selectedEdgeId: null,
  searchedNode: null,
  statusMessage: ""
};

let nextEdgeId = 1;

const positions = createPositions(graph.nodes);

const ui = {
  addEdgeForm: document.getElementById("addEdgeForm"),
  removeEdgeForm: document.getElementById("removeEdgeForm"),
  updateWeightForm: document.getElementById("updateWeightForm"),
  searchNodeForm: document.getElementById("searchNodeForm"),
  scenarioButtons: document.querySelectorAll("[data-scenario]"),
  btnComputeMST: document.getElementById("btnComputeMST"),
  btnDetectAnomaly: document.getElementById("btnDetectAnomaly"),
  addFrom: document.getElementById("addFrom"),
  addTo: document.getElementById("addTo"),
  addWeight: document.getElementById("addWeight"),
  removeEdgeId: document.getElementById("removeEdgeId"),
  updateEdgeId: document.getElementById("updateEdgeId"),
  updateWeightValue: document.getElementById("updateWeightValue"),
  searchNode: document.getElementById("searchNode"),
  graphSvg: document.getElementById("graphSvg"),
  mstSvg: document.getElementById("mstSvg"),
  edgeInspector: document.getElementById("edgeInspector"),
  mstEdgesList: document.getElementById("mstEdgesList"),
  allEdgesList: document.getElementById("allEdgesList"),
  anomalyList: document.getElementById("anomalyList"),
  anomalySummary: document.getElementById("anomalySummary"),
  searchResult: document.getElementById("searchResult"),
  statusMessage: document.getElementById("statusMessage"),
  mstEdgeCount: document.getElementById("mstEdgeCount"),
  mstTotalWeight: document.getElementById("mstTotalWeight"),
  mstSummary: document.getElementById("mstSummary"),
  mstStateBadge: document.getElementById("mstStateBadge")
};

function createPositions(count) {
  const result = {};
  const cx = 380;
  const cy = 380;
  const radius = 290;

  for (let node = 1; node <= count; node += 1) {
    const angle = (-Math.PI / 2) + ((node - 1) * ((Math.PI * 2) / count));
    result[node] = {
      x: cx + Math.cos(angle) * radius,
      y: cy + Math.sin(angle) * radius
    };
  }

  return result;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function newEdge(from, to, weight) {
  return { id: nextEdgeId++, from, to, weight };
}

function suspicion(edge) {
  if (edge.weight > 0) {
    return {
      level: "Safe",
      explanation: "This edge is valid because its weight is strictly positive."
    };
  }

  return {
    level: "Cursed / Suspicious",
    explanation: "Stable weights must be strictly positive, so this edge is excluded from the MST."
  };
}

function loadEdges(edges, message) {
  graph.edges = [];
  nextEdgeId = 1;
  edges.forEach((edge) => addEdge(graph, newEdge(edge.from, edge.to, edge.weight)));
  state.selectedEdgeId = null;
  state.searchedNode = null;
  state.statusMessage = message;
  renderAll();
}

function recompute() {
  state.anomalies = detectAnomaly(graph);
  state.mst = computeMST(graph);

  if (state.selectedEdgeId && !graph.edges.some((edge) => edge.id === state.selectedEdgeId)) {
    state.selectedEdgeId = null;
  }
}

function renderSelects() {
  const options = graph.edges.length
    ? graph.edges.map((edge) => `<option value="${edge.id}">#${edge.id} (${edge.from} - ${edge.to}, w=${edge.weight})</option>`).join("")
    : '<option value="">No edges</option>';

  ui.removeEdgeId.innerHTML = options;
  ui.updateEdgeId.innerHTML = options;
  ui.removeEdgeId.disabled = graph.edges.length === 0;
  ui.updateEdgeId.disabled = graph.edges.length === 0;
}

function renderInspector() {
  const edge = graph.edges.find((item) => item.id === state.selectedEdgeId);

  if (!edge) {
    ui.edgeInspector.className = "inspector muted";
    ui.edgeInspector.innerHTML = "Click an edge to see its details.";
    return;
  }

  const details = suspicion(edge);
  ui.edgeInspector.className = "inspector";
  ui.edgeInspector.innerHTML = `
    <div><strong>From node</strong><span>${edge.from}</span></div>
    <div><strong>To node</strong><span>${edge.to}</span></div>
    <div><strong>Weight</strong><span>${edge.weight}</span></div>
    <div><strong>Suspicion</strong><span>${details.level}</span></div>
    <div class="inspector-wide"><strong>Explanation</strong><span>${details.explanation}</span></div>
  `;
}

function renderMSTList() {
  const mstIds = new Set(state.mst.edges.map((edge) => edge.id));

  ui.mstEdgeCount.textContent = state.mst.edges.length;
  ui.mstTotalWeight.textContent = state.mst.totalWeight;
  ui.mstStateBadge.textContent = state.mst.isComplete ? "Complete MST" : "Incomplete";
  ui.mstStateBadge.className = state.mst.isComplete ? "badge complete" : "badge";
  ui.mstSummary.textContent = state.mst.isComplete
    ? `Full MST ready with ${state.mst.edges.length} edges.`
    : `Current result is a forest. Components remaining: ${state.mst.componentCount}.`;

  ui.mstEdgesList.innerHTML = state.mst.edges.length
    ? state.mst.edges.map((edge) => `<li class="edge-mst"><strong>#${edge.id} | ${edge.from} - ${edge.to}</strong><small>Weight ${edge.weight}</small></li>`).join("")
    : "<li>No MST edges.</li>";

  ui.allEdgesList.innerHTML = graph.edges.length
    ? graph.edges.map((edge) => {
      const classes = [
        edge.weight <= 0 ? "edge-cursed" : "",
        mstIds.has(edge.id) ? "edge-mst" : "",
        state.searchedNode && (edge.from === state.searchedNode || edge.to === state.searchedNode) ? "edge-search" : ""
      ].filter(Boolean).join(" ");
      return `<li class="${classes}"><strong>#${edge.id} | ${edge.from} - ${edge.to}</strong><small>Weight ${edge.weight}. ${escapeHtml(suspicion(edge).level)}</small></li>`;
    }).join("")
    : "<li>No edges.</li>";
}

function renderAnomalies() {
  if (state.anomalies.length === 0) {
    ui.anomalySummary.textContent = "No cursed edges detected.";
    ui.anomalyList.innerHTML = "<li>No anomalies.</li>";
    return;
  }

  ui.anomalySummary.textContent = `${state.anomalies.length} cursed edge(s) excluded from MST.`;
  ui.anomalyList.innerHTML = state.anomalies.map((item) => `
    <li class="edge-cursed">
      <strong>#${item.edge.id} | ${item.edge.from} - ${item.edge.to}</strong>
      <small>${escapeHtml(item.reason)}</small>
    </li>
  `).join("");
}

function renderSearch() {
  if (!state.searchedNode) {
    ui.searchResult.className = "message muted";
    ui.searchResult.textContent = "Pick a node from 1 to 13 to list all connected edges.";
    return;
  }

  const edges = graph.edges.filter((edge) => edge.from === state.searchedNode || edge.to === state.searchedNode);

  if (edges.length === 0) {
    ui.searchResult.className = "message muted";
    ui.searchResult.textContent = `Node ${state.searchedNode} has no connected edges.`;
    return;
  }

  ui.searchResult.className = "message";
  ui.searchResult.innerHTML = edges.map((edge) => {
    const other = edge.from === state.searchedNode ? edge.to : edge.from;
    return `#${edge.id}: ${state.searchedNode} - ${other}, weight ${edge.weight}`;
  }).join("<br>");
}

function edgeStyle(edge, mstIds, anomalyIds) {
  if (state.selectedEdgeId === edge.id) return { stroke: "#111111", width: 5, dash: "0" };
  if (anomalyIds.has(edge.id)) return { stroke: "#cc0000", width: 4, dash: "10 8" };
  if (mstIds.has(edge.id)) return { stroke: "#007744", width: 4, dash: "0" };
  if (state.searchedNode && (edge.from === state.searchedNode || edge.to === state.searchedNode)) return { stroke: "#1d5fd1", width: 3, dash: "0" };
  return { stroke: "#b8b8b8", width: 2, dash: "0" };
}

function renderGraph() {
  const mstIds = new Set(state.mst.edges.map((edge) => edge.id));
  const anomalyIds = new Set(state.anomalies.map((item) => item.edge.id));

  const edges = graph.edges.map((edge) => {
    const a = positions[edge.from];
    const b = positions[edge.to];
    const x = (a.x + b.x) / 2;
    const y = (a.y + b.y) / 2;
    const style = edgeStyle(edge, mstIds, anomalyIds);

    return `
      <g class="edge-group" data-edge-id="${edge.id}" tabindex="0">
        <line x1="${a.x}" y1="${a.y}" x2="${b.x}" y2="${b.y}" stroke="transparent" stroke-width="18" stroke-linecap="round"></line>
        <line x1="${a.x}" y1="${a.y}" x2="${b.x}" y2="${b.y}" stroke="${style.stroke}" stroke-width="${style.width}" stroke-dasharray="${style.dash}" stroke-linecap="round"></line>
        <rect x="${x - 24}" y="${y - 15}" width="48" height="30" rx="4" fill="#ffffff" stroke="${style.stroke}"></rect>
        <text x="${x}" y="${y + 5}" text-anchor="middle" font-size="14" font-weight="700">${edge.weight}</text>
        ${edge.weight <= 0 ? `<text x="${x}" y="${y + 27}" text-anchor="middle" font-size="11" font-weight="700" fill="#cc0000">cursed</text>` : ""}
      </g>
    `;
  }).join("");

  const nodes = Array.from({ length: graph.nodes }, (_, index) => index + 1).map((node) => {
    const p = positions[node];
    const searched = state.searchedNode === node;
    return `
      <g>
        <circle cx="${p.x}" cy="${p.y}" r="26" fill="#ffffff" stroke="${searched ? "#1d5fd1" : "#007744"}" stroke-width="${searched ? 4 : 3}"></circle>
        <text x="${p.x}" y="${p.y + 6}" text-anchor="middle" font-size="18" font-weight="700">${node}</text>
      </g>
    `;
  }).join("");

  ui.graphSvg.innerHTML = `<rect width="760" height="760" fill="#fcfcfc"></rect>${edges}${nodes}`;

  ui.graphSvg.querySelectorAll(".edge-group").forEach((group) => {
    const select = () => {
      state.selectedEdgeId = Number(group.dataset.edgeId);
      renderAll();
    };
    group.addEventListener("click", select);
    group.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        select();
      }
    });
  });
}

function renderMSTGraph() {
  const edges = state.mst.edges.map((edge) => {
    const a = positions[edge.from];
    const b = positions[edge.to];
    const x = (a.x + b.x) / 2;
    const y = (a.y + b.y) / 2;
    return `
      <line x1="${a.x}" y1="${a.y}" x2="${b.x}" y2="${b.y}" stroke="#007744" stroke-width="4" stroke-linecap="round"></line>
      <text x="${x}" y="${y}" text-anchor="middle" font-size="14" font-weight="700">${edge.weight}</text>
    `;
  }).join("");

  const nodes = Array.from({ length: graph.nodes }, (_, index) => index + 1).map((node) => {
    const p = positions[node];
    return `
      <circle cx="${p.x}" cy="${p.y}" r="22" fill="#ffffff" stroke="#007744" stroke-width="2"></circle>
      <text x="${p.x}" y="${p.y + 5}" text-anchor="middle" font-size="15" font-weight="700">${node}</text>
    `;
  }).join("");

  ui.mstSvg.innerHTML = `<rect width="760" height="760" fill="#fcfcfc"></rect>${edges}${nodes}`;
}

function renderAll() {
  recompute();
  renderSelects();
  renderGraph();
  renderMSTGraph();
  renderInspector();
  renderMSTList();
  renderAnomalies();
  renderSearch();
  ui.statusMessage.textContent = state.statusMessage;
}

function handleAdd(event) {
  event.preventDefault();

  try {
    const edge = addEdge(graph, newEdge(Number(ui.addFrom.value), Number(ui.addTo.value), Number(ui.addWeight.value)));
    ui.addEdgeForm.reset();
    state.statusMessage = `Added edge #${edge.id}.`;
    renderAll();
  } catch (error) {
    state.statusMessage = error.message;
    ui.statusMessage.textContent = state.statusMessage;
  }
}

function handleRemove(event) {
  event.preventDefault();

  try {
    const edge = removeEdge(graph, Number(ui.removeEdgeId.value));
    state.statusMessage = `Removed edge #${edge.id}.`;
    renderAll();
  } catch (error) {
    state.statusMessage = error.message;
    ui.statusMessage.textContent = state.statusMessage;
  }
}

function handleUpdate(event) {
  event.preventDefault();

  try {
    const edge = updateWeight(graph, Number(ui.updateEdgeId.value), Number(ui.updateWeightValue.value));
    ui.updateWeightForm.reset();
    state.statusMessage = `Updated edge #${edge.id}.`;
    renderAll();
  } catch (error) {
    state.statusMessage = error.message;
    ui.statusMessage.textContent = state.statusMessage;
  }
}

function handleSearch(event) {
  event.preventDefault();
  const node = Number(ui.searchNode.value);

  if (!Number.isInteger(node) || node < 1 || node > graph.nodes) {
    state.statusMessage = `Choose a node between 1 and ${graph.nodes}.`;
    ui.statusMessage.textContent = state.statusMessage;
    return;
  }

  state.searchedNode = node;
  state.statusMessage = `Showing node ${node}.`;
  renderAll();
}

function handleComputeMST() {
  state.mst = computeMST(graph);
  state.statusMessage = `computeMST() returned ${state.mst.edges.length} edge(s), total weight ${state.mst.totalWeight}.`;
  renderAll();
}

function handleDetectAnomaly() {
  state.anomalies = detectAnomaly(graph);
  state.statusMessage = `detectAnomaly() found ${state.anomalies.length} cursed edge(s).`;
  renderAll();
}

function handleScenario(event) {
  const name = event.currentTarget.dataset.scenario;
  loadEdges(scenarios[name], `Scenario loaded: ${event.currentTarget.textContent.trim()}.`);
}

ui.addEdgeForm.addEventListener("submit", handleAdd);
ui.removeEdgeForm.addEventListener("submit", handleRemove);
ui.updateWeightForm.addEventListener("submit", handleUpdate);
ui.searchNodeForm.addEventListener("submit", handleSearch);
ui.btnComputeMST.addEventListener("click", handleComputeMST);
ui.btnDetectAnomaly.addEventListener("click", handleDetectAnomaly);
ui.scenarioButtons.forEach((button) => button.addEventListener("click", handleScenario));

loadEdges(initialEdges, "Started with only the 2 sample PDF edges.");
