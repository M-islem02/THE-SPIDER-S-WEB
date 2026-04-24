// DOM rendering (edge list, MST, anomalies, inspector) and canvas drawing.

const state = {
  mstEdges: [],
  anomalies: [],
  selectedEdge: null,
  nodePositions: {},
  dragging: null,
  dragOffset: { x: 0, y: 0 },
};

function renderEdgeList() {
  const mstIds = new Set(state.mstEdges.map(e => e.id));
  const cursedIds = new Set(state.anomalies.map(a => a.edge.id));
  let html = '';
  graph.edges.forEach(e => {
    const inMST = mstIds.has(e.id);
    const cursed = cursedIds.has(e.id);
    html += `<div class="edge-item ${cursed ? 'cursed' : inMST ? 'in-mst' : ''}" data-edge-id="${e.id}">
      <span>#${e.id} · ${e.from} → ${e.to} · w=${e.weight}</span>
      ${cursed ? '<span class="tag tag-cursed">CURSED</span>' : inMST ? '<span class="tag tag-mst">MST</span>' : ''}
    </div>`;
  });
  document.getElementById('edgeList').innerHTML = html;
}

function renderMST() {
  const total = state.mstEdges.reduce((s, e) => s + e.weight, 0);
  let html = '';
  state.mstEdges.forEach(e => {
    html += `<div class="mst-item"><span>${e.from} ↔ ${e.to}</span><span class="weight">w = ${e.weight}</span></div>`;
  });
  html += `<div class="mst-total">Total Weight: ${total}</div>`;
  document.getElementById('mstList').innerHTML = html;
}

function renderAnomalies() {
  if (state.anomalies.length === 0) {
    document.getElementById('anomalyReport').innerHTML = '<div class="no-anomaly">✓ No anomalies detected</div>';
    return;
  }
  let html = '';
  state.anomalies.forEach(a => {
    html += `<div class="anomaly-item">
      <div class="edge-id">Edge #${a.edge.id} (${a.edge.from} → ${a.edge.to})</div>
      <div class="reason">${a.reason}</div>
    </div>`;
  });
  document.getElementById('anomalyReport').innerHTML = html;
}

function renderInspector(edge) {
  const isMST = state.mstEdges.some(m => m.id === edge.id);
  const isCursed = edge.weight <= 0;
  const suspicion = isCursed ? 'HIGH — Cursed' : (edge.weight > 17 ? 'MEDIUM — High weight' : 'LOW');
  document.getElementById('inspector').innerHTML = `
    <span class="key">Edge ID:</span> <span class="val">${edge.id}</span><br>
    <span class="key">Connection:</span> <span class="val">${edge.from} → ${edge.to}</span><br>
    <span class="key">Weight:</span> <span class="val ${isCursed ? 'red' : 'green'}">${edge.weight}</span><br>
    <span class="key">In MST:</span> <span class="val ${isMST ? 'green' : ''}">${isMST ? 'Yes' : 'No'}</span><br>
    <span class="key">Suspicion:</span> <span class="val ${isCursed ? 'red' : ''}">${suspicion}</span>
  `;
}

function initPositions() {
  const canvas = document.getElementById('graph');
  const W = canvas.offsetWidth, H = canvas.offsetHeight;
  const cx = W / 2, cy = H / 2, r = Math.min(W, H) * 0.38;
  for (let i = 1; i <= graph.nodes; i++) {
    const angle = ((i - 1) / graph.nodes) * Math.PI * 2 - Math.PI / 2;
    state.nodePositions[i] = { x: cx + Math.cos(angle) * r, y: cy + Math.sin(angle) * r };
  }
}

function drawGrid(ctx, W, H) {
  const step = 40;
  ctx.strokeStyle = '#eeeeee';
  ctx.lineWidth = 1;
  ctx.beginPath();
  for (let x = 0; x <= W; x += step) { ctx.moveTo(x, 0); ctx.lineTo(x, H); }
  for (let y = 0; y <= H; y += step) { ctx.moveTo(0, y); ctx.lineTo(W, y); }
  ctx.stroke();
}

function drawGraph() {
  const canvas = document.getElementById('graph');
  const ctx = canvas.getContext('2d');
  canvas.width = canvas.offsetWidth;
  canvas.height = canvas.offsetHeight;

  if (Object.keys(state.nodePositions).length === 0) initPositions();

  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  drawGrid(ctx, canvas.width, canvas.height);

  const mstIds = new Set(state.mstEdges.map(e => e.id));
  const cursedIds = new Set(state.anomalies.map(a => a.edge.id));

  graph.edges.forEach(e => {
    const p1 = state.nodePositions[e.from];
    const p2 = state.nodePositions[e.to];
    if (!p1 || !p2) return;

    const isMST = mstIds.has(e.id);
    const isCursed = cursedIds.has(e.id);
    const isSelected = state.selectedEdge && state.selectedEdge.id === e.id;

    ctx.beginPath();
    ctx.moveTo(p1.x, p1.y);
    ctx.lineTo(p2.x, p2.y);

    if (isCursed) {
      ctx.strokeStyle = '#cc0000';
      ctx.lineWidth = isSelected ? 4 : 3;
      ctx.setLineDash([8, 6]);
    } else if (isMST) {
      ctx.strokeStyle = '#007744';
      ctx.lineWidth = isSelected ? 4 : 3;
      ctx.setLineDash([]);
    } else {
      ctx.strokeStyle = isSelected ? '#555555' : '#b8b8b8';
      ctx.lineWidth = isSelected ? 2 : 1;
      ctx.setLineDash([]);
    }
    ctx.stroke();
    ctx.setLineDash([]);

    const mx = (p1.x + p2.x) / 2;
    const my = (p1.y + p2.y) / 2;
    const label = String(e.weight);
    ctx.font = '600 14px Inter, system-ui, sans-serif';
    const metrics = ctx.measureText(label);
    const w = metrics.width + 12;
    const h = 18;
    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = isCursed ? '#cc0000' : isMST ? '#007744' : '#d8d8d8';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.rect(mx - w / 2, my - h / 2, w, h);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = isCursed ? '#cc0000' : isMST ? '#007744' : '#444444';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(label, mx, my);
  });

  for (let i = 1; i <= graph.nodes; i++) {
    const p = state.nodePositions[i];
    if (!p) continue;

    ctx.beginPath();
    ctx.arc(p.x, p.y, 22, 0, Math.PI * 2);
    ctx.fillStyle = '#ffffff';
    ctx.fill();
    ctx.strokeStyle = '#007744';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    ctx.font = '700 16px Inter, system-ui, sans-serif';
    ctx.fillStyle = '#111111';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(i, p.x, p.y);
  }
}
