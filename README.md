# Deck Chatbot

This project provides a simple Express server with a chatbot interface for deck sales and quoting automation. It includes endpoints for calculating deck measurements and uploading images.

## Setup
1. Install dependencies:
   ```bash
   npm install
   ```
2. Copy `.env.example` to `.env` and add your `OPENAI_API_KEY`.
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
## Backup\nRun `npm run backup` to export saved measurements to measurement_backup.json.
