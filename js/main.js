// Event handlers, canvas interaction, and app initialization.

function refresh() {
  state.mstEdges = computeMST(graph);
  state.anomalies = detectAnomaly(graph);
  renderEdgeList();
  renderMST();
  renderAnomalies();
  drawGraph();
}

function inspectEdge(edge) {
  state.selectedEdge = edge;
  renderInspector(edge);
  drawGraph();
}

function handleAddEdge() {
  const from = parseInt(document.getElementById('addFrom').value);
  const to = parseInt(document.getElementById('addTo').value);
  const weight = parseInt(document.getElementById('addWeight').value);
  if (!from || !to || isNaN(weight)) return alert('Please fill in all fields.');
  if (from < 1 || from > 13 || to < 1 || to > 13) return alert('Nodes must be between 1 and 13.');
  if (from === to) return alert('A node cannot connect to itself.');
  addEdgeTo(graph, makeEdge(from, to, weight));
  ['addFrom', 'addTo', 'addWeight'].forEach(id => { document.getElementById(id).value = ''; });
  refresh();
}

function handleRemoveEdge() {
  const id = parseInt(document.getElementById('removeId').value);
  if (!id) return alert('Please enter an edge ID.');
  removeEdgeFrom(graph, id);
  document.getElementById('removeId').value = '';
  refresh();
}

function handleReset() {
  graph.edges = buildInitialEdges();
  state.selectedEdge = null;
  state.nodePositions = {};
  document.getElementById('inspector').innerHTML = '<span class="key">Click an edge to inspect it.</span>';
  initPositions();
  refresh();
}

function handleSearch() {
  const node = parseInt(document.getElementById('searchNode').value);
  if (!node || node < 1 || node > 13) return alert('Enter a valid node (1-13).');
  const connected = graph.edges.filter(e => e.from === node || e.to === node);
  const insp = document.getElementById('inspector');
  if (connected.length === 0) {
    insp.innerHTML = `<span class="key">Node ${node}</span><br><span class="val red">No connections found.</span>`;
    return;
  }
  let html = `<span class="val">Node ${node} connections:</span><br><br>`;
  connected.forEach(e => {
    const other = e.from === node ? e.to : e.from;
    const cursed = e.weight <= 0;
    html += `<span class="key">→ Node ${other}</span> &nbsp; <span class="val ${cursed ? 'red' : 'green'}">w = ${e.weight}${cursed ? ' · CURSED' : ''}</span><br>`;
  });
  insp.innerHTML = html;
}

function pointToSegment(px, py, ax, ay, bx, by) {
  const dx = bx - ax, dy = by - ay;
  const len2 = dx * dx + dy * dy;
  if (len2 === 0) return Math.hypot(px - ax, py - ay);
  const t = Math.max(0, Math.min(1, ((px - ax) * dx + (py - ay) * dy) / len2));
  return Math.hypot(px - (ax + t * dx), py - (ay + t * dy));
}

function nodeAt(mx, my) {
  for (let i = 1; i <= graph.nodes; i++) {
    const p = state.nodePositions[i];
    if (!p) continue;
    if (Math.hypot(mx - p.x, my - p.y) < 22) return i;
  }
  return null;
}

function edgeAt(mx, my) {
  let closest = null, minDist = 14;
  graph.edges.forEach(e => {
    const p1 = state.nodePositions[e.from];
    const p2 = state.nodePositions[e.to];
    if (!p1 || !p2) return;
    const d = pointToSegment(mx, my, p1.x, p1.y, p2.x, p2.y);
    if (d < minDist) { minDist = d; closest = e; }
  });
  return closest;
}

function wireCanvas() {
  const canvas = document.getElementById('graph');

  canvas.addEventListener('mousedown', e => {
    const rect = canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;
    const n = nodeAt(mx, my);
    if (n) {
      state.dragging = n;
      state.dragOffset = { x: mx - state.nodePositions[n].x, y: my - state.nodePositions[n].y };
      return;
    }
    const edge = edgeAt(mx, my);
    if (edge) inspectEdge(edge);
  });

  canvas.addEventListener('mousemove', e => {
    if (!state.dragging) return;
    const rect = canvas.getBoundingClientRect();
    state.nodePositions[state.dragging] = {
      x: e.clientX - rect.left - state.dragOffset.x,
      y: e.clientY - rect.top - state.dragOffset.y
    };
    drawGraph();
  });

  canvas.addEventListener('mouseup', () => { state.dragging = null; });

  canvas.addEventListener('touchstart', ev => {
    if (!ev.touches[0]) return;
    const rect = canvas.getBoundingClientRect();
    const mx = ev.touches[0].clientX - rect.left;
    const my = ev.touches[0].clientY - rect.top;
    const n = nodeAt(mx, my);
    if (n) {
      state.dragging = n;
      state.dragOffset = { x: mx - state.nodePositions[n].x, y: my - state.nodePositions[n].y };
      ev.preventDefault();
      return;
    }
    const edge = edgeAt(mx, my);
    if (edge) inspectEdge(edge);
  }, { passive: false });

  canvas.addEventListener('touchmove', ev => {
    if (!state.dragging || !ev.touches[0]) return;
    const rect = canvas.getBoundingClientRect();
    state.nodePositions[state.dragging] = {
      x: ev.touches[0].clientX - rect.left - state.dragOffset.x,
      y: ev.touches[0].clientY - rect.top - state.dragOffset.y
    };
    drawGraph();
    ev.preventDefault();
  }, { passive: false });

  canvas.addEventListener('touchend', () => { state.dragging = null; });
}

function wireButtons() {
  document.getElementById('btnAdd').addEventListener('click', handleAddEdge);
  document.getElementById('btnRemove').addEventListener('click', handleRemoveEdge);
  document.getElementById('btnSearch').addEventListener('click', handleSearch);
  document.getElementById('btnReset').addEventListener('click', handleReset);

  document.getElementById('edgeList').addEventListener('click', ev => {
    const item = ev.target.closest('.edge-item');
    if (!item) return;
    const id = parseInt(item.dataset.edgeId);
    const edge = graph.edges.find(e => e.id === id);
    if (edge) inspectEdge(edge);
  });
}

window.addEventListener('resize', () => {
  initPositions();
  drawGraph();
});

window.addEventListener('DOMContentLoaded', () => {
  wireButtons();
  wireCanvas();
  initPositions();
  refresh();
});
