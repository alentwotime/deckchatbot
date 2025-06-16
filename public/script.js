// Deck Chatbot Frontend JavaScript
class DeckChatbot {
  constructor() {
    this.apiKey = 'revamp123secure';
    this.baseUrl = window.location.origin;
    this.init();
  }

  init() {
    this.bindEvents();
    this.loadTheme();
    this.showWelcomeMessage();
  }

  bindEvents() {
    // Chat form submission
    document.getElementById('chatForm')?.addEventListener('submit', (e) => {
      e.preventDefault();
      this.sendMessage();
    });

    // File upload events
    this.setupFileUpload();
  }

  setupFileUpload() {
    const dropZone = document.getElementById('dropZone');
    const fileInput = document.getElementById('fileInput');
    const uploadButton = document.getElementById('uploadButton');

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
        this.selectedFile = file;
        this.showFilePreview(file);
      }
    });

    fileInput?.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) {
        this.selectedFile = file;
        this.showFilePreview(file);
      }
    });

    uploadButton?.addEventListener('click', () => {
      if (this.selectedFile) {
        this.uploadFile('/upload-image');
      } else {
        alert('Please select a file first.');
      }
    });
  }

  showFilePreview(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      const previewImage = document.getElementById('preview');
      if (previewImage) {
        previewImage.src = e.target.result;
        previewImage.classList.remove('d-none');
      }
    };
    reader.readAsDataURL(file);
  }

  async uploadFile(endpoint) {
    const formData = new FormData();
    formData.append('image', this.selectedFile);

    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: formData
      });

      const data = await response.json();
      if (response.ok) {
        alert('File uploaded successfully.');
      } else {
        alert(data.error || 'Upload failed.');
      }
    } catch (error) {
      alert(error.message || 'Upload failed.');
    }
  }

  showWelcomeMessage() {
    alert('Welcome to Deck Chatbot!');
  }
}

// Initialize the chatbot when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  window.deckChatbot = new DeckChatbot();
});
