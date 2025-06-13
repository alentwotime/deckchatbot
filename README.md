# deckchatbot
AI-powered chatbot for deck sales and quoting automation.

## Setup
1. Install dependencies:
   ```bash
   npm install
   ```
2. Copy `.env.example` to `.env` and set your `OPENAI_API_KEY`.
3. Start the server:
   ```bash
   npm start
   ```
The app will be available at `http://localhost:3000`.

## Logging
Winston logs requests and errors to `logs/app.log` and to STDOUT. Adjust the `LOG_LEVEL` environment variable (e.g. `info`, `debug`) to control verbosity.

## Environment Variables
Copy `.env.example` to `.env` and set your keys:
```
OPENAI_API_KEY=your-api-key
LOG_LEVEL=info
```

## API Endpoints

### `POST /calculate-multi-shape`
Calculate the area of multiple shapes. Example request:
```bash
curl -X POST http://localhost:3000/calculate-multi-shape \
  -H "Content-Type: application/json" \
  -d '{"shapes":[{"type":"rectangle","dimensions":{"length":10,"width":20}},{"type":"polygon","dimensions":{"points":[{"x":0,"y":0},{"x":4,"y":0},{"x":4,"y":3}] }},{"type":"circle","dimensions":{"radius":5},"isPool":true}],"wastagePercent":10}'
```

### `POST /upload-measurements`
Upload an image for OCR calculation:
```bash
curl -X POST http://localhost:3000/upload-measurements \
  -F image=@/path/to/photo.jpg
```

### `POST /chatbot`
Ask the chatbot a question:
```bash
curl -X POST http://localhost:3000/chatbot \
  -H "Content-Type: application/json" \
  -d '{"message":"How do I calculate deck area?"}'
```

## Running Tests
Install dependencies and run the test suite with:
```bash
npm install
npm test
```
The tests use Jest and Supertest to verify the geometry helpers and Express endpoints.
