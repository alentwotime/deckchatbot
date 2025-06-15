const dropZone = document.getElementById('dropZone');
const fileInput = document.getElementById('fileInput');
const preview = document.getElementById('preview');
const spinner = document.getElementById('spinner');

function handleFiles(files) {
  const file = files[0];
  if (!file) return;
  fileInput.files = files;
  const reader = new FileReader();
  reader.onload = e => {
    preview.src = e.target.result;
    preview.classList.remove('d-none');
  };
  reader.readAsDataURL(file);
}

dropZone.addEventListener('click', () => fileInput.click());
dropZone.addEventListener('dragover', e => {
  e.preventDefault();
  dropZone.classList.add('dragover');
});
dropZone.addEventListener('dragleave', () => dropZone.classList.remove('dragover'));
dropZone.addEventListener('drop', e => {
  e.preventDefault();
  dropZone.classList.remove('dragover');
  handleFiles(e.dataTransfer.files);
});

fileInput.addEventListener('change', e => handleFiles(e.target.files));

document.getElementById('uploadButton').addEventListener('click', async () => {
  const file = fileInput.files[0];
  if (!file) {
    alert('Please select an image');
    return;
  }

  const formData = new FormData();
  formData.append('image', file);

  spinner.classList.remove('d-none');
  try {
    const res = await fetch('/upload-drawing', {
      method: 'POST',
      headers: { 'Authorization': 'Bearer revamp123secure' },
      body: formData
    });
    const data = await res.json();
    spinner.classList.add('d-none');
    if (res.ok) {
      alert('Uploaded to ' + data.filePath);
    } else {
      alert(data.error || 'Upload failed');
    }
  } catch (err) {
    spinner.classList.add('d-none');
    alert(err.message || 'Upload failed');
  }
});
