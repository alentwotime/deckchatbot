const form = document.getElementById('chatForm');
form.addEventListener('submit', e => {
  e.preventDefault();
  sendMessage();
});

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
    let text;
    if (data.error) {
      text = `Error: ${data.error}`;
    } else {
      text = `Outer Deck Area: ${data.outerDeckArea} sq ft\n` +
        `Pool Area: ${data.poolArea} sq ft\n` +
        `Usable Deck Area: ${data.usableDeckArea} sq ft\n` +
        `Railing Footage: ${data.railingFootage} ft`;
      if (data.explanation) text += `\n${data.explanation}`;
      if (data.warning) text += `\n${data.warning}`;
    }
    appendMessage('bot', text);
  } catch (err) {
    appendMessage('bot', `Error: ${err.message}`);
  }

  document.getElementById('messages').scrollTop = messagesDiv.scrollHeight;
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
 codex/improve-html-design-appeal
    const svgText = await response.text();
    const blob = new Blob([svgText], { type: 'image/svg+xml' });
=======
    const blob = await response.blob();
 main
    const url = URL.createObjectURL(blob);
    document.getElementById('digitalImage').src = url;
  } else {
    const data = await response.json();
    alert(data.error || 'Error processing drawing.');
  }

  drawInput.value = '';
}
