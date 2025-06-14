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
 codex/suggest-improvements-for-bot-logic
 codex/suggest-improvements-for-bot-logic
=======
 hw8fkw-codex/suggest-improvements-for-bot-logic
=======
 codex/suggest-improvements-for-bot-logic
 main
 main
   The app will be available at `http://localhost:3000` or the port specified by `PORT`.

## Logging
Winston logs requests and errors to `logs/app.log` and to STDOUT. Adjust `LOG_LEVEL` in `.env` to control verbosity.
 codex/suggest-improvements-for-bot-logic
=======
 hw8fkw-codex/suggest-improvements-for-bot-logic

## Environment Variables
=======
 main

## Environment Variables
=======
The app will be available at `http://localhost:3000`.

## Logging
Winston logs requests and errors to `logs/app.log` and to STDOUT. Adjust the `LOG_LEVEL` environment variable (e.g. `info`, `debug`) to control verbosity.

## Environment Variables
Copy `.env.example` to `.env` and set your keys:
 main
 codex/suggest-improvements-for-bot-logic
=======
 main
 main
```
OPENAI_API_KEY=your-api-key
LOG_LEVEL=info
PORT=3000
```

## Running the Server
```bash
npm start
```

## API Endpoints

### `POST /calculate-multi-shape`
 codex/suggest-improvements-for-bot-logic
 codex/suggest-improvements-for-bot-logic
Calculate the area of multiple shapes.
=======
Calculate the area of multiple shapes. Example request:
```bash
curl -X POST http://localhost:3000/calculate-multi-shape \
  -H "Content-Type: application/json" \
  -d '{"shapes":[{"type":"rectangle","dimensions":{"length":10,"width":20}},{"type":"polygon","dimensions":{"points":[{"x":0,"y":0},{"x":4,"y":0},{"x":4,"y":3}] }},{"type":"circle","dimensions":{"radius":5},"isPool":true}],"wastagePercent":10}'
```
 main
=======
 hw8fkw-codex/suggest-improvements-for-bot-logic
=======
 codex/suggest-improvements-for-bot-logic
 main
Calculate the area of multiple shapes.
 main

### `POST /upload-measurements`
Upload an image containing measurements. OCR is used to extract points and compute deck area.

### `POST /digitalize-drawing`
Upload a photo of a hand-drawn deck. The image is vectorized and OCR is run to detect coordinate pairs. The response includes an SVG along with any detected points and calculated area.

### `POST /chatbot`
General chat endpoint.

## Running Tests
Install dependencies and run the test suite with:
```bash
npm test
```
 codex/suggest-improvements-for-bot-logic
=======
 hw8fkw-codex/suggest-improvements-for-bot-logic

=======
 main
 codex/suggest-improvements-for-bot-logic

=======
 main
 codex/suggest-improvements-for-bot-logic
=======
 main
The tests use Jest and Supertest to verify the geometry helpers and Express endpoints.

