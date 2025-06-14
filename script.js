function appendMessage(role, text) {
  const div = document.createElement('div');
  div.className = `message ${role}`;
  div.innerHTML = text; // preserves HTML like <br>
  document.getElementById('messages').appendChild(div);
}

async function sendMessage() {
  const input = document.getElementById('userInput');
  const userInput = input.value.trim();
  if (!userInput) {
    return;
  }

  appendMessage('user', userInput);

  try {
    const response = await fetch('/chatbot', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: userInput })
    });
    const data = await response.json();
    appendMessage('bot', data.response || `Error: ${data.error || 'Unable to get response.'}`);
  } catch (err) {
    appendMessage('bot', `Error: ${err.message}`);
  }

  const messagesDiv = document.getElementById('messages');
  messagesDiv.scrollTop = messagesDiv.scrollHeight;
  input.value = '';
}

document.getElementById('chatForm').addEventListener('submit', (e) => {
  e.preventDefault();
  sendMessage();
});

async function uploadImage() {
  const fileInput = document.getElementById('imageInput');
  const file = fileInput.files[0];
  if (!file) {
    alert('Please select an image to upload.');
    return;
  }

  console.log('📤 Uploading image:', file.name); // Debug log

  const formData = new FormData();
  formData.append('image', file); // Must match upload.single('image')

  try {
    const response = await fetch('/upload-measurements', {
      method: 'POST',
      body: formData
    });
    const data = await response.json();
    if (data.error) {
      appendMessage('bot', `Error: ${data.error}`);
    } else {
      let text = `Outer Deck Area: ${data.outerDeckArea} sq ft<br>` +
                 `Pool Area: ${data.poolArea} sq ft<br>` +
                 `Usable Deck Area: ${data.usableDeckArea} sq ft<br>` +
                 `Railing Footage: ${data.railingFootage} ft`;
      if (data.explanation) {
        text += `<br>${data.explanation}`;
      }
      if (data.warning) {
        text += `<br>${data.warning}`;
      }
      appendMessage('bot', text);
    }
  } catch (err) {
    appendMessage('bot', `Error: ${err.message}`);
  }

  const messagesDiv = document.getElementById('messages');
  messagesDiv.scrollTop = messagesDiv.scrollHeight;
  fileInput.value = '';
}

async function uploadDrawing() {
  const drawInput = document.getElementById('drawingInput');
  const file = drawInput.files[0];
  if (!file) {
    alert('Please select a drawing to upload.');
    return;
  }

  const formData = new FormData();
  formData.append('image', file);

  const response = await fetch('/digitalize-drawing', {
    method: 'POST',
    body: formData
  });

  if (response.ok) {
    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    document.getElementById('digitalImage').src = url;
  } else {
    const data = await response.json();
    alert(data.error || 'Error processing drawing.');
  }

  drawInput.value = '';
}

function toggleTheme() {
  const { body } = document;
  const newTheme = body.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
  body.setAttribute('data-theme', newTheme);
  localStorage.setItem('theme', newTheme);
}

document.getElementById('themeToggle').addEventListener('click', toggleTheme);

window.addEventListener('DOMContentLoaded', () => {
  const saved = localStorage.getItem('theme') || 'light';
  document.body.setAttribute('data-theme', saved);

  const deckForm = document.getElementById('deckForm');
  if (deckForm) {
    deckForm.addEventListener('submit', e => {
      e.preventDefault();
      calculateDeck();
    });
  }

  const shapeSelect = document.getElementById('shape');
  if (shapeSelect) {
    shapeSelect.addEventListener('change', updateShapeFields);
    updateShapeFields();
  }

  const showBoards = document.getElementById('showBoards');
  if (showBoards) {
    showBoards.addEventListener('change', () => calculateDeck());
  }

  document.getElementById('exportBtn')?.addEventListener('click', exportCanvas);
  document.getElementById('printBtn')?.addEventListener('click', () => window.print());
});

function updateShapeFields() {
  const shape = document.getElementById('shape').value;
  document.querySelectorAll('.shape-l,.shape-oct,.shape-rect').forEach(el => {
    el.style.display = 'none';
  });
  if (shape === 'rectangle') {
    document.querySelectorAll('.shape-rect').forEach(el => (el.style.display = 'block'));
  } else if (shape === 'lshape') {
    document.querySelectorAll('.shape-l').forEach(el => (el.style.display = 'block'));
  } else if (shape === 'octagon') {
    document.querySelectorAll('.shape-oct').forEach(el => (el.style.display = 'block'));
  }
}

function calculateDeck() {
  const shape = document.getElementById('shape').value;
  const boardWidth = parseFloat(document.getElementById('boardWidth').value);
  const boardLength = parseFloat(document.getElementById('boardLength').value);
  const waste = parseFloat(document.getElementById('waste').value) || 0;
  const orientation = document.getElementById('orientation').value;
  const attachment = document.getElementById('attachment').value;
  const height = parseFloat(document.getElementById('height').value) || 0;
  const railings = document.getElementById('railings').checked;
  const stairs = document.getElementById('stairs').checked;

  let dims = {};
  let area = 0;
  if (shape === 'rectangle') {
    const length = parseFloat(document.getElementById('length').value);
    const width = parseFloat(document.getElementById('width').value);
    if ([length, width, boardWidth, boardLength].some(isNaN)) return;
    area = length * width;
    dims = { length, width };
  } else if (shape === 'lshape') {
    const l1 = parseFloat(document.getElementById('length1').value);
    const w1 = parseFloat(document.getElementById('width1').value);
    const l2 = parseFloat(document.getElementById('length2').value);
    const w2 = parseFloat(document.getElementById('width2').value);
    if ([l1, w1, l2, w2, boardWidth, boardLength].some(isNaN)) return;
    area = l1 * w1 + l2 * w2;
    dims = { length1: l1, width1: w1, length2: l2, width2: w2 };
  } else if (shape === 'octagon') {
    const side = parseFloat(document.getElementById('side').value);
    if ([side, boardWidth, boardLength].some(isNaN)) return;
    area = 2 * (1 + Math.SQRT2) * Math.pow(side, 2);
    dims = { side };
  }

  const boardArea = (boardWidth / 12) * boardLength;
  const totalBoards = Math.ceil((area / boardArea) * (1 + waste / 100));

  const structure = estimateStructure(shape, dims, orientation, attachment, height, railings, stairs);

  const results = document.getElementById('calcResults');
  let html =
    `Total Area: ${area.toFixed(2)} sq ft<br>` +
    `Board Coverage: ${boardArea.toFixed(2)} sq ft per board<br>` +
    `Boards Needed: ${totalBoards}`;
  html += `<br><br><strong>Structure Estimate</strong><br>` +
          `Joists: ${structure.joists}<br>` +
          `Beams: ${structure.beams}<br>` +
          `Posts: ${structure.posts}<br>`;
  if (railings) {
    html += `Railing: ${structure.railing.toFixed(1)} ft<br>` +
            `Railing Posts: ${structure.railingPosts}<br>`;
  }
  if (stairs) {
    html += `Stair Steps: ${structure.steps}<br>` +
            `Stringers: ${structure.stringers}<br>` +
            `Treads: ${structure.treads}<br>`;
  }
  results.innerHTML = html;

  drawDeck(shape, dims, boardWidth, orientation, document.getElementById('showBoards').checked);
}

function drawDeck(shape, dims, boardWidth, orientation, showBoards) {
  const canvas = document.getElementById('deckCanvas');
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  let width, length;
  if (shape === 'rectangle') {
    ({ width, length } = dims);
  } else if (shape === 'lshape') {
    width = dims.width1 + dims.length2;
    length = dims.length1 + dims.width2;
  } else if (shape === 'octagon') {
    width = length = dims.side * (1 + Math.SQRT2);
  }

  const scale = Math.min(canvas.width / width, canvas.height / length);
  const offX = (canvas.width - width * scale) / 2;
  const offY = (canvas.height - length * scale) / 2;

  ctx.fillStyle = '#cfe2ff';
  ctx.strokeStyle = '#000';

  if (shape === 'rectangle') {
    const w = width * scale;
    const l = length * scale;
    ctx.fillRect(offX, offY, w, l);
    ctx.strokeRect(offX, offY, w, l);
    drawDims(ctx, offX, offY, w, l, width, length);
    if (showBoards) drawBoards(ctx, offX, offY, w, l, boardWidth, orientation, scale);
  } else if (shape === 'lshape') {
    const r1 = { w: dims.width1 * scale, l: dims.length1 * scale };
    const r2 = { w: dims.length2 * scale, l: dims.width2 * scale };
    ctx.fillRect(offX, offY, r1.w, r1.l);
    ctx.strokeRect(offX, offY, r1.w, r1.l);
    ctx.fillRect(offX, offY + r1.l, r2.w, r2.l);
    ctx.strokeRect(offX, offY + r1.l, r2.w, r2.l);
    drawDims(ctx, offX, offY, width * scale, length * scale, width, length);
    if (showBoards) {
      const maskCanvas = document.createElement('canvas');
      maskCanvas.width = canvas.width;
      maskCanvas.height = canvas.height;
      const mctx = maskCanvas.getContext('2d');
      mctx.rect(offX, offY, r1.w, r1.l);
      mctx.rect(offX, offY + r1.l, r2.w, r2.l);
      mctx.clip();
      drawBoards(mctx, offX, offY, width * scale, length * scale, boardWidth, orientation, scale);
      ctx.drawImage(maskCanvas, 0, 0);
    }
  } else if (shape === 'octagon') {
    const s = dims.side * scale;
    const radius = s / (2 * Math.sin(Math.PI / 8));
    ctx.beginPath();
    for (let i = 0; i < 8; i++) {
      const angle = (Math.PI / 4) * i - Math.PI / 8;
      const x = offX + width * scale / 2 + radius * Math.cos(angle);
      const y = offY + length * scale / 2 + radius * Math.sin(angle);
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    drawDims(ctx, offX, offY, width * scale, length * scale, width, length);
    if (showBoards) drawBoards(ctx, offX, offY, width * scale, length * scale, boardWidth, orientation, scale);
  }
}

function drawDims(ctx, x, y, w, l, widthFt, lengthFt) {
  ctx.fillStyle = '#000';
  ctx.font = '12px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(`${lengthFt} ft`, x + w / 2, y - 5);
  ctx.save();
  ctx.translate(x - 5, y + l / 2);
  ctx.rotate(-Math.PI / 2);
  ctx.fillText(`${widthFt} ft`, 0, 0);
  ctx.restore();
}

function drawBoards(ctx, x, y, w, l, boardWidth, orientation, scale) {
  ctx.strokeStyle = '#666';
  const gap = (boardWidth / 12) * scale;
  if (orientation === 'horizontal') {
    for (let yp = y + gap; yp < y + l; yp += gap) {
      ctx.beginPath();
      ctx.moveTo(x, yp);
      ctx.lineTo(x + w, yp);
      ctx.stroke();
    }
  } else {
    for (let xp = x + gap; xp < x + w; xp += gap) {
      ctx.beginPath();
      ctx.moveTo(xp, y);
      ctx.lineTo(xp, y + l);
      ctx.stroke();
    }
  }
}

function estimateStructure(shape, dims, orientation, attachment, height, railings, stairs) {
  let width, length;
  if (shape === 'rectangle') {
    ({ width, length } = dims);
  } else if (shape === 'lshape') {
    width = dims.width1 + dims.length2;
    length = dims.length1 + dims.width2;
  } else {
    width = length = dims.side * (1 + Math.SQRT2);
  }

  const joistSpacing = 16 / 12; // ft
  const joists = Math.ceil((orientation === 'horizontal' ? width : length) / joistSpacing) + 1;

  const beamSpacing = 8; // ft span
  const beams = Math.max(2, Math.ceil((orientation === 'horizontal' ? length : width) / beamSpacing) + 1);
  const posts = beams * Math.ceil((orientation === 'horizontal' ? length : width) / beamSpacing + 1);

  let perimeter = 0;
  if (shape === 'rectangle') {
    perimeter = 2 * (width + length);
  } else if (shape === 'lshape') {
    const pts = [
      { x: 0, y: 0 },
      { x: width, y: 0 },
      { x: width, y: dims.length1 },
      { x: dims.width1 + dims.length2, y: dims.length1 },
      { x: dims.width1 + dims.length2, y: length },
      { x: 0, y: length }
    ];
    perimeter = 0;
    for (let i = 0; i < pts.length; i++) {
      const p1 = pts[i];
      const p2 = pts[(i + 1) % pts.length];
      perimeter += Math.hypot(p2.x - p1.x, p2.y - p1.y);
    }
  } else {
    perimeter = 8 * dims.side;
  }
  if (attachment === 'attached') perimeter -= width; // approximate

  const railingPosts = railings ? Math.ceil(perimeter / 6) + 1 : 0;

  const steps = stairs ? Math.ceil((height * 12) / 7) : 0;
  const stringers = stairs ? 3 : 0;
  const treads = stairs ? steps : 0;

  return { joists, beams, posts, railing: perimeter, railingPosts, steps, stringers, treads };
}

function exportCanvas() {
  const canvas = document.getElementById('deckCanvas');
  const link = document.createElement('a');
  link.href = canvas.toDataURL('image/png');
  link.download = 'deck.png';
  link.click();
}
