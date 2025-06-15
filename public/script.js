
function appendMessage(role, text) {
  const div = document.createElement('div');
  div.className = `message ${role}`;
  div.innerHTML = text;
  document.getElementById('messages').appendChild(div);
  document.getElementById('messages').scrollTop = document.getElementById('messages').scrollHeight;
}

async function sendMessage() {
  const input = document.getElementById('userInput');
  const userInput = input.value.trim();
  if (!userInput) {
    return;
  }

  appendMessage('user', userInput);
  input.value = '';

  try {
    const response = await fetch('/chatbot', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer revamp123secure',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ message: userInput })
    });

    const data = await response.json();
    appendMessage('bot', data.response || '⚠️ No reply.');
  } catch (err) {
    appendMessage('bot', `Error: ${err.message}`);
  }
}

document.getElementById('chatForm')?.addEventListener('submit', (e) => {
  e.preventDefault();
  sendMessage();
});

// Upload logic with drag-and-drop + progress
const dropZone = document.getElementById('dropZone');
const progressBar = document.getElementById('progressBar');
const preview = document.getElementById('preview');

function handleUpload(file) {
  const formData = new FormData();
  formData.append('drawing', file);

  const xhr = new XMLHttpRequest();
  xhr.open('POST', '/upload-drawing', true);
  xhr.setRequestHeader('Authorization', 'Bearer revamp123secure');

  xhr.upload.onprogress = (e) => {
    if (e.lengthComputable) {
      const percent = (e.loaded / e.total) * 100;
      progressBar.style.width = percent + '%';
      progressBar.innerText = Math.round(percent) + '%';
    }
  };

  xhr.onload = () => {
    progressBar.style.width = '0%';
    progressBar.innerText = '';
    if (xhr.status === 200) {
      const res = JSON.parse(xhr.responseText);
      if (res.filename) {
        preview.src = `/uploads/${res.filename}`;
        preview.style.display = 'block';
        appendMessage('bot', `✅ Drawing uploaded. Calculated square footage: ${res.squareFootage || 'N/A'}`);
      } else {
        appendMessage('bot', '⚠️ Upload successful, but no data returned.');
      }
    } else {
      appendMessage('bot', '❌ Upload failed.');
    }
  };

  xhr.onerror = () => {
    progressBar.style.width = '0%';
    progressBar.innerText = '';
    appendMessage('bot', '❌ Network error during upload.');
  };

  xhr.send(formData);
}

dropZone?.addEventListener('dragover', (e) => {
  e.preventDefault();
  dropZone.classList.add('dragover');
});

dropZone?.addEventListener('dragleave', () => {
  dropZone.classList.remove('dragover');
});

dropZone?.addEventListener('drop', (e) => {
  e.preventDefault();
  dropZone.classList.remove('dragover');
  const file = e.dataTransfer.files[0];
  if (file) {
    handleUpload(file);
  }
});

document.getElementById('fileInput')?.addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (file) {
    handleUpload(file);
  }
});

// Theme toggle
function toggleTheme() {
  const { body } = document;
  const newTheme = body.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
  body.setAttribute('data-theme', newTheme);
  localStorage.setItem('theme', newTheme);
}
document.getElementById('themeToggle')?.addEventListener('click', toggleTheme);

window.addEventListener('DOMContentLoaded', () => {
  const saved = localStorage.getItem('theme') || 'light';
  document.body.setAttribute('data-theme', saved);
});
