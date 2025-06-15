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

    // Quick calculator
    document.getElementById('quickCalcForm')?.addEventListener('submit', (e) => {
      e.preventDefault();
      this.quickCalculate();
    });

    // Theme toggle
    document.getElementById('themeToggle')?.addEventListener('click', () => {
      this.toggleTheme();
    });

    // File upload events
    this.setupFileUpload();
  }

  setupFileUpload() {
    const dropZone = document.getElementById('dropZone');
    const fileInput = document.getElementById('fileInput');
    const uploadMeasurements = document.getElementById('uploadMeasurements');
    const digitalizeBtn = document.getElementById('digitalizeBtn');

    // Drag and drop handlers
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

    // Click to upload
    dropZone?.addEventListener('click', () => {
      fileInput?.click();
    });

    fileInput?.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) {
        this.selectedFile = file;
        this.showFilePreview(file);
      }
    });

    // Upload buttons
    uploadMeasurements?.addEventListener('click', () => {
      if (this.selectedFile) {
        this.uploadFile('/upload-measurements');
      } else {
        this.appendMessage('bot', '❌ Please select a file first.');
      }
    });

    digitalizeBtn?.addEventListener('click', () => {
      if (this.selectedFile) {
        this.uploadFile('/digitalize-drawing');
      } else {
        this.appendMessage('bot', '❌ Please select a file first.');
      }
    });
  }

  showFilePreview(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      const previewImage = document.getElementById('previewImage');
      if (previewImage) {
        previewImage.src = e.target.result;
        const modal = new bootstrap.Modal(document.getElementById('imagePreviewModal'));
        modal.show();
      }
    };
    reader.readAsDataURL(file);
    
    this.appendMessage('bot', `📁 File selected: ${file.name} (${this.formatFileSize(file.size)})`);
  }

  formatFileSize(bytes) {
    if (bytes === 0) {
      return '0 Bytes';
    }
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  appendMessage(role, text) {
    const messagesContainer = document.getElementById('messages');
    if (!messagesContainer) {
      return;
    }

    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${role}`;
    
    // Handle markdown-like formatting
    const formattedText = this.formatMessage(text);
    messageDiv.innerHTML = formattedText;
    
    messagesContainer.appendChild(messageDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
    
    // Add animation class
    setTimeout(() => messageDiv.classList.add('fade-in'), 10);
  }

  formatMessage(text) {
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/`(.*?)`/g, '<code>$1</code>')
      .replace(/\n/g, '<br>');
  }

  showWelcomeMessage() {
    this.appendMessage('bot', 
      '👋 Welcome to Deck Chatbot! I can help you with:\n\n' +
      '• 📏 Calculating deck measurements and materials\n' +
      '• 📸 Analyzing uploaded drawings and photos\n' +
      '• 💰 Generating cost estimates\n' +
      '• 🎨 Converting drawings to digital formats\n\n' +
      'What can I help you with today?'
    );
  }

  async sendMessage() {
    const input = document.getElementById('userInput');
    const userInput = input?.value.trim();
    
    if (!userInput) {
      return;
    }

    this.appendMessage('user', userInput);
    input.value = '';

    // Show typing indicator
    this.showTypingIndicator();

    try {
      const response = await fetch(`${this.baseUrl}/chatbot`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ message: userInput })
      });

      const data = await response.json();
      this.hideTypingIndicator();

      if (response.ok) {
        this.appendMessage('bot', data.response || '⚠️ No reply received.');
      } else {
        this.appendMessage('bot', `❌ Error: ${data.errors?.[0]?.msg || data.error || 'Unknown error'}`);
      }
    } catch (err) {
      this.hideTypingIndicator();
      this.appendMessage('bot', `🌐 Network Error: ${err.message}`);
    }
  }

  showTypingIndicator() {
    const indicator = document.createElement('div');
    indicator.className = 'message bot typing-indicator';
    indicator.id = 'typing-indicator';
    indicator.innerHTML = '🤖 <span class="loading"></span> Thinking...';
    
    document.getElementById('messages')?.appendChild(indicator);
    document.getElementById('messages').scrollTop = document.getElementById('messages').scrollHeight;
  }

  hideTypingIndicator() {
    const indicator = document.getElementById('typing-indicator');
    indicator?.remove();
  }

  async uploadFile(endpoint) {
    if (!this.selectedFile) {
      return;
    }

    const formData = new FormData();
    const fieldName = endpoint.includes('measurements') ? 'image' : 'image';
    formData.append(fieldName, this.selectedFile);

    this.showUploadProgress();
    this.appendMessage('bot', `📤 Uploading ${this.selectedFile.name}...`);

    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: formData
      });

      const data = await response.json();
      this.hideUploadProgress();

      if (response.ok) {
        if (endpoint.includes('measurements')) {
          this.handleMeasurementResult(data);
        } else if (endpoint.includes('digitalize')) {
          this.handleDigitalizeResult(data);
        }
      } else {
        this.appendMessage('bot', `❌ Upload failed: ${data.errors?.[0]?.msg || 'Unknown error'}`);
      }
    } catch (error) {
      this.hideUploadProgress();
      this.appendMessage('bot', `🌐 Upload error: ${error.message}`);
    }
  }

  handleMeasurementResult(data) {
    let message = '✅ **Measurement Analysis Complete!**\n\n';
    
    if (data.usableDeckArea) {
      message += `📐 **Usable Deck Area:** ${data.usableDeckArea} sq ft\n`;
    }
    
    if (data.railingFootage) {
      message += `🔗 **Railing Needed:** ${data.railingFootage} ft\n`;
    }
    
    if (data.poolArea && parseFloat(data.poolArea) > 0) {
      message += `🏊 **Pool/Cutout Area:** ${data.poolArea} sq ft\n`;
    }
    
    if (data.skirting) {
      message += `\n**Skirting Information:**\n`;
      message += `• Panels needed: ${data.skirting.panelsNeeded}\n`;
      message += `• Linear footage: ${data.skirting.linearFeet} ft\n`;
    }
    
    if (data.warning) {
      message += `\n⚠️ ${data.warning}`;
    }

    this.appendMessage('bot', message);
  }

  handleDigitalizeResult(data) {
    if (data.svg || data.success) {
      this.appendMessage('bot', '✅ **Drawing Digitalized Successfully!**\n\nYour drawing has been converted to a digital format.');
    } else {
      this.appendMessage('bot', '❌ Failed to digitalize drawing. Please try with a clearer image.');
    }
  }

  showUploadProgress() {
    const progressContainer = document.getElementById('uploadProgress');
    const progressBar = document.getElementById('progressBar');
    
    if (progressContainer && progressBar) {
      progressContainer.classList.add('show');
      progressBar.style.width = '0%';
      
      // Simulate progress
      let progress = 0;
      const interval = setInterval(() => {
        progress += Math.random() * 15;
        progress = Math.min(progress, 90);
        progressBar.style.width = progress + '%';
        progressBar.textContent = Math.round(progress) + '%';
      }, 200);
      
      this.progressInterval = interval;
    }
  }

  hideUploadProgress() {
    const progressContainer = document.getElementById('uploadProgress');
    const progressBar = document.getElementById('progressBar');
    
    if (this.progressInterval) {
      clearInterval(this.progressInterval);
    }
    
    if (progressContainer && progressBar) {
      progressBar.style.width = '100%';
      progressBar.textContent = '100%';
      
      setTimeout(() => {
        progressContainer.classList.remove('show');
        progressBar.style.width = '0%';
        progressBar.textContent = '';
      }, 1000);
    }
  }

  quickCalculate() {
    const length = parseFloat(document.getElementById('quickLength')?.value);
    const width = parseFloat(document.getElementById('quickWidth')?.value);
    const resultDiv = document.getElementById('quickResult');
    
    if (!length || !width || length <= 0 || width <= 0) {
      if (resultDiv) {
        resultDiv.innerHTML = '<span class="text-danger">❌ Please enter valid dimensions</span>';
      }
      return;
    }
    
    const area = length * width;
    const perimeter = 2 * (length + width);
    
    if (resultDiv) {
      resultDiv.innerHTML = `
        <div class="text-success">
          <strong>📐 Area:</strong> ${area.toFixed(2)} sq ft<br>
          <strong>📏 Perimeter:</strong> ${perimeter.toFixed(2)} ft
        </div>
      `;
    }
    
    this.appendMessage('bot', 
      `🧮 **Quick Calculation Results:**\n` +
      `• **Dimensions:** ${length}' × ${width}'\n` +
      `• **Area:** ${area.toFixed(2)} sq ft\n` +
      `• **Perimeter:** ${perimeter.toFixed(2)} ft`
    );
  }

  toggleTheme() {
    const { body } = document;
    const currentTheme = body.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    body.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    
    // Update theme icon
    const themeIcon = document.querySelector('.theme-icon');
    if (themeIcon) {
      themeIcon.textContent = newTheme === 'dark' ? '🌙' : '☀️';
    }
  }

  loadTheme() {
    const savedTheme = localStorage.getItem('theme') || 'dark';
    document.body.setAttribute('data-theme', savedTheme);
    
    const themeIcon = document.querySelector('.theme-icon');
    if (themeIcon) {
      themeIcon.textContent = savedTheme === 'dark' ? '🌙' : '☀️';
    }
  }
}

// Initialize the chatbot when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  window.deckChatbot = new DeckChatbot();
});
