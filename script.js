function appendMessage(role, text) {
  const div = document.createElement('div');
  div.className = `message ${role}`;
  div.textContent = text;
  document.getElementById('messages').appendChild(div);
}

async function sendMessage() {
  const input = document.getElementById('userInput');
  const userInput = input.value.trim();
  if (!userInput) return;

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

  const formData = new FormData();
  formData.append('image', file);

  try {
    const response = await fetch('/upload-measurements', {
      method: 'POST',
      body: formData
    });
    const data = await response.json();
    if (data.error) {
      appendMessage('bot', `Error: ${data.error}`);
    } else {
      let text = `Outer Deck Area: ${data.outerDeckArea} sq ft\n` +
        `Pool Area: ${data.poolArea} sq ft\n` +
        `Usable Deck Area: ${data.usableDeckArea} sq ft\n` +
        `Railing Footage: ${data.railingFootage} ft`;
      if (data.explanation) text += `\n${data.explanation}`;
      if (data.warning) text += `\n${data.warning}`;
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
  const preview = document.getElementById('drawingPreview');
  const progressBar = document.getElementById('uploadProgressBar');
  const modalEl = document.getElementById('drawingModal');
  const file = drawInput.files[0];
  if (!file) {
    alert('Please select a drawing to upload.');
    return;
  }

  progressBar.style.display = 'block';
  const formData = new FormData();
  formData.append('image', file);

  try {
    const response = await fetch('/digitalize-drawing', {
      method: 'POST',
      body: formData
    });

    if (response.ok) {
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      document.getElementById('digitalImage').src = url;
      if (window.bootstrap) {
        bootstrap.Modal.getInstance(modalEl).hide();
      }
    } else {
      const data = await response.json();
      alert(data.error || 'Error processing drawing.');
    }
  } catch (err) {
    alert('Error processing drawing.');
  } finally {
    progressBar.style.display = 'none';
    drawInput.value = '';
    preview.style.display = 'none';
  }
}

function toggleTheme() {
  const body = document.body;
  const newTheme = body.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
  body.setAttribute('data-theme', newTheme);
  localStorage.setItem('theme', newTheme);
}

document.getElementById('themeToggle').addEventListener('click', toggleTheme);

window.addEventListener('DOMContentLoaded', () => {
  const saved = localStorage.getItem('theme') || 'light';
  document.body.setAttribute('data-theme', saved);

  const dropZone = document.getElementById('drawingDropZone');
  const drawInput = document.getElementById('drawingInput');
  const preview = document.getElementById('drawingPreview');

  function showPreview(file) {
    if (!file) return;
    preview.src = URL.createObjectURL(file);
    preview.style.display = 'block';
  }

  dropZone.addEventListener('click', () => drawInput.click());
  dropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropZone.classList.add('dragover');
  });
  dropZone.addEventListener('dragleave', () => dropZone.classList.remove('dragover'));
  dropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropZone.classList.remove('dragover');
    if (e.dataTransfer.files[0]) {
      drawInput.files = e.dataTransfer.files;
      showPreview(e.dataTransfer.files[0]);
    }
  });

  drawInput.addEventListener('change', () => showPreview(drawInput.files[0]));
});
