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

  const showBoards = document.getElementById('showBoards');
  if (showBoards) {
    showBoards.addEventListener('change', () => calculateDeck());
  }
});

function calculateDeck() {
  const length = parseFloat(document.getElementById('length').value);
  const width = parseFloat(document.getElementById('width').value);
  const boardWidth = parseFloat(document.getElementById('boardWidth').value);
  const boardLength = parseFloat(document.getElementById('boardLength').value);
  const waste = parseFloat(document.getElementById('waste').value) || 0;

  if ([length, width, boardWidth, boardLength].some(isNaN)) {
    return;
  }

  const deckArea = length * width;
  const boardArea = (boardWidth / 12) * boardLength;
  const totalBoards = Math.ceil((deckArea / boardArea) * (1 + waste / 100));

  const results = document.getElementById('calcResults');
  results.innerHTML =
    `Deck Area: ${deckArea.toFixed(2)} sq ft<br>` +
    `Board Coverage: ${boardArea.toFixed(2)} sq ft per board<br>` +
    `Boards Needed: ${totalBoards}`;

  // Optional server-side calculation
  fetch('/calculate-deck', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ length, width, boardWidth, boardLength, waste })
  })
    .then(r => (r.ok ? r.json() : null))
    .then(data => {
      if (data) {
        results.innerHTML =
          `Deck Area: ${data.deckArea} sq ft<br>` +
          `Board Coverage: ${data.boardArea} sq ft per board<br>` +
          `Boards Needed: ${data.boards}`;
      }
    })
    .catch(() => {});

  drawDeck(length, width, boardWidth, document.getElementById('showBoards').checked);
}

function drawDeck(length, width, boardWidth, showBoards) {
  const canvas = document.getElementById('deckCanvas');
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const scale = Math.min(canvas.width / length, canvas.height / width);
  const deckLen = length * scale;
  const deckWid = width * scale;
  const offsetX = (canvas.width - deckLen) / 2;
  const offsetY = (canvas.height - deckWid) / 2;

  ctx.fillStyle = '#cfe2ff';
  ctx.fillRect(offsetX, offsetY, deckLen, deckWid);
  ctx.strokeStyle = '#000';
  ctx.strokeRect(offsetX, offsetY, deckLen, deckWid);

  ctx.fillStyle = '#000';
  ctx.font = '12px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(`${length} ft`, offsetX + deckLen / 2, offsetY - 5);
  ctx.save();
  ctx.translate(offsetX - 5, offsetY + deckWid / 2);
  ctx.rotate(-Math.PI / 2);
  ctx.fillText(`${width} ft`, 0, 0);
  ctx.restore();

  if (showBoards) {
    ctx.strokeStyle = '#666';
    const gap = (boardWidth / 12) * scale;
    for (let x = offsetX + gap; x < offsetX + deckLen; x += gap) {
      ctx.beginPath();
      ctx.moveTo(x, offsetY);
      ctx.lineTo(x, offsetY + deckWid);
      ctx.stroke();
    }
  }
}
