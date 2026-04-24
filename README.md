# Greed Island: The Spider's Web

Local SPA for a 13-node weighted graph challenge.

## Run
Use a local server because the JavaScript uses ES modules.

```bash
python3 -m http.server 4174
```

Open:

```text
http://127.0.0.1:4174/index.html
```

## Features
- add, remove, and update edges
- search connected edges by node
- load `Scenario 1` to `Scenario 4`
- run `computeMST()` and `detectAnomaly()` from buttons
- show full graph in SVG
- show MST in SVG and list form
- mark `weight <= 0` edges as cursed

## Files
- `index.html`
- `css/styles.css`
- `js/addEdge.js`
- `js/removeEdge.js`
- `js/updateWeight.js`
- `js/computeMST.js`
- `js/detectAnomaly.js`
- `js/app.js`
- `strategy.txt`
- `file-1777022025206-875611518.pdf`
