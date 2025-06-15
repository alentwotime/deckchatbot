# Deck Chatbot

A comprehensive Node.js application for deck planning and calculation with AI-powered chat capabilities.

## Features

- **AI-Powered Chatbot**: Integration with OpenAI GPT for intelligent deck planning conversations
- **Deck Calculator**: Calculate materials needed for various deck shapes (rectangle, circle, triangle)
- **Image Analysis**: Upload and analyze deck drawings and images
- **Multi-Shape Support**: Handle complex deck designs with multiple geometric shapes
- **Real-time Chat**: Interactive web interface for seamless user experience
- **File Upload**: Support for image uploads and drawing digitalization
- **Database Storage**: SQLite database for storing conversations and measurements
- **Rate Limiting**: Built-in API rate limiting for security
- **Logging**: Comprehensive logging with Winston
- **Clustering**: Multi-process support for better performance

## Installation

1. Clone the repository:

   ```bash
   git clone <repository-url>
   cd deckchatbot
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Set up environment variables:

   ```bash
   cp .env.example .env
   # Edit .env with your OpenAI API key and other configurations
   ```

4. Run setup script:

   ```bash
   npm run setup
   ```

## Configuration

Create a `.env` file with the following variables:

```properties
OPENAI_API_KEY=your_openai_api_key_here
API_KEY=your_api_key_here
NODE_ENV=development
PORT=3000
MEM_DB=
LOG_LEVEL=info
```

## Usage

### Development

```bash
npm run dev
```

### Production

```bash
npm start
```

### Testing

```bash
npm test
```

## API Endpoints

### Chat

- `POST /chatbot` - Send message to AI chatbot
- Headers: `Authorization: Bearer <API_KEY>`
- Body: `{"message": "your message here"}`

### Calculations

- `POST /calculate-deck-materials` - Calculate materials for single deck
- `POST /calculate-multi-shape` - Calculate for multiple geometric shapes

### File Upload

- `POST /upload-image` - Upload general images
- `POST /digitalize-drawing` - Upload and process deck drawings

### Health Check

- `GET /health` - Application health status

## Project Structure

deckchatbot/
├── controllers/          # Request handlers
├── middleware/          # Express middleware
├── routes/             # API routes
├── services/           # External service integrations
├── utils/              # Utility functions
├── public/             # Static files
├── uploads/            # File uploads
├── logs/               # Application logs
├── scripts/            # Utility scripts
└── tests/              # Test files

## Architecture

- **Backend**: Node.js with Express.js framework
- **Database**: SQLite with better-sqlite3
- **AI Integration**: OpenAI GPT API
- **Frontend**: Vanilla JavaScript with Bootstrap
- **Logging**: Winston with daily rotation
- **Security**: Helmet, CORS, rate limiting

## Security Features

- API key authentication
- Rate limiting
- Input validation
- File type restrictions
- Error handling and logging
- CORS configuration

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support and questions, please open an issue in the repository.
