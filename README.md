# Greed Island: The Spider's Web

Local SPA for a 13-node weighted graph challenge.

## Run
Use a local server:

```bash
python3 -m http.server 4174
```

Open:

```text
http://127.0.0.1:4174/index.html
```

## Summary
The app starts with 13 nodes and only the 2 sample edges from the challenge.
The user can build the graph from the UI.

It supports:
- `addEdge(graph, edge)`
- `removeEdge(graph, edgeId)`
- `updateWeight(graph, edgeId, newWeight)`
- `computeMST(graph)`
- `detectAnomaly(graph)`

Rules:
- `weight > 0` is valid
- `weight <= 0` is cursed
- cursed edges are excluded from MST
- MST is recomputed after every change

## Files
- `index.html`
- `css/styles.css`
- `js/addEdge.js`
- `js/removeEdge.js`
- `js/updateWeight.js`
- `js/computeMST.js`
- `js/detectAnomaly.js`
- `js/app.js`
