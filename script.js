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
});
