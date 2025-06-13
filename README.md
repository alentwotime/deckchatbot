# deckchatbot

AI-powered chatbot for deck sales and quoting automation.

## Setup
1. Install dependencies:
   ```bash
   npm install
   ```
 codex/clean-up-merge-artifacts
2. Copy `.env.example` to `.env` and set `OPENAI_API_KEY`.
=======
2. Copy `.env.example` to `.env` and set your `OPENAI_API_KEY`.
 main
3. Start the server:
   ```bash
   npm start
   ```
 codex/enhance-ocr-and-drawing-features

 codex/clean-up-merge-artifacts
The app will be available at `http://localhost:3000`.

## Logging
=======
The app runs at `http://localhost:3000`.

## Logging

Winston logs requests and errors to `logs/app.log` and to STDOUT. Adjust `LOG_LEVEL` in `.env` to control verbosity.
=======
The app will be available at `http://localhost:3000`.

## Logging
 main
Winston logs requests and errors to `logs/app.log` and to STDOUT. Adjust the `LOG_LEVEL` environment variable (e.g. `info`, `debug`) to control verbosity.

## Environment Variables
Copy `.env.example` to `.env` and set your keys:
 codex/clean-up-merge-artifacts

=======
 main
```
OPENAI_API_KEY=your-api-key
LOG_LEVEL=info
```
 codex/clean-up-merge-artifacts

## Running the Server
```bash
npm start
```
=======
 main
 main

## API Endpoints

### `POST /calculate-multi-shape`
 codex/enhance-ocr-and-drawing-features
Calculate the area of multiple shapes.
=======
Calculate the area of multiple shapes. Example request:
```bash
curl -X POST http://localhost:3000/calculate-multi-shape \
  -H "Content-Type: application/json" \
  -d '{"shapes":[{"type":"rectangle","dimensions":{"length":10,"width":20}},{"type":"polygon","dimensions":{"points":[{"x":0,"y":0},{"x":4,"y":0},{"x":4,"y":3}] }},{"type":"circle","dimensions":{"radius":5},"isPool":true}],"wastagePercent":10}'
```
 main

### `POST /upload-measurements`
Upload an image containing measurements. OCR is used to extract points and compute deck area.

### `POST /digitalize-drawing`
Upload a photo of a hand-drawn deck. The image is vectorized and OCR is run to detect coordinate pairs. The response includes an SVG along with any detected points and calculated area.

 codex/enhance-ocr-and-drawing-features
### `POST /chatbot`
General chat endpoint.

 codex/clean-up-merge-artifacts
=======
## Testing

Run the test suite with:
=======
 main
## Running Tests
Install dependencies and run the test suite with:
 main
```bash
npm test
```
 codex/enhance-ocr-and-drawing-features
=======
The tests use Jest and Supertest to verify the geometry helpers and Express endpoints.
