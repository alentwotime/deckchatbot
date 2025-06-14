# Deck Chatbot

This project provides a simple Express server with a chatbot interface for deck sales and quoting automation. It includes endpoints for calculating deck measurements and uploading images. A `/chatbot/history` endpoint is also available to view recent conversation logs.

## Setup
1. Install dependencies:
   ```bash
   npm install
   ```
 codex/add-rate-limiting-middleware
2. Copy `.env.example` to `.env` and add your `OPENAI_API_KEY`.
   You can also adjust `RATE_LIMIT_WINDOW_MS` and `RATE_LIMIT_MAX` to customize
   request rate limiting.
=======
2. Copy `.env.example` to `.env` and add your `OPENAI_API_KEY`. The server will
   fail to start if this variable is not provided.
 main
3. Start the server:
   ```bash
   npm start
   ```

The app will be available at `http://localhost:3000` or the port specified by `PORT`.

## Running Tests
Run the test suite with:
```bash
npm test
```
