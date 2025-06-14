# Deck Chatbot

This project provides a simple Express server with a chatbot interface for deck sales and quoting automation. It includes endpoints for calculating deck measurements and uploading images.

## Setup
1. Install dependencies:
   ```bash
   npm install
   ```
2. Copy `.env.example` to `.env` and add your `OPENAI_API_KEY`.
   You can also set `MEM_DB` to choose a custom path for the SQLite database.
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
## Backup
Run `npm run backup` to export saved measurements to measurement_backup.json.

## Documentation

- [Master Prompt](docs/MASTER_PROMPT.md)
- [Measurement Extraction Logic](docs/MEASUREMENT_EXTRACTION.md)
- [File Upload Troubleshooting](docs/FILE_UPLOAD_TROUBLESHOOTING.md)
- [Setup Troubleshooting](docs/SETUP_TROUBLESHOOTING.md)
## API
- **API:** `POST /calculate-skirting` – estimate skirting materials using feet/inch measurements
- Uploads mentioning "skirting" auto-return perimeter and panel estimates

### Direct start
Running `node server.cjs` starts a single-process server if you prefer not to use the cluster entry point.

