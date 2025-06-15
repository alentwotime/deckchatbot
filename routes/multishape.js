<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Multi-Shape Deck Builder</title>
  <style>
    body { font-family: Arial; padding: 20px; }
    .shape-block { border: 1px solid #ccc; padding: 15px; margin-bottom: 10px; }
    .hidden { display: none; }
    label { display: block; margin-top: 10px; }
  </style>
</head>
<body>
  <h1>🧱 Deck Shape Builder</h1>

  <form id="shapeForm">
    <label>Project Label:
      <input type="text" name="label" placeholder="e.g. Backyard A" required />
    </label>

    <div id="shapesContainer"></div>

    <button type="button" id="addShapeBtn">+ Add Shape</button>
    <button type="submit">Submit Shapes</button>
  </form>

  <pre id="botResponse"></pre>

  <script src="/multishape.js"></script>
</body>
</html>
