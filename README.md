# deckchatbot
AI-powered chatbot for deck sales and quoting automation.

 codex/add-and-configure-logging-middleware
## Logging

Winston logs requests and errors to `logs/app.log` and to STDOUT. Adjust the
`LOG_LEVEL` environment variable (e.g. `info`, `debug`) to control verbosity.
=======
codex/install-express-validator-and-apply-validation
## Setup

```bash
npm install
```

Copy `.env.example` to `.env` and set your `OPENAI_API_KEY` before running the server.

## Running

```bash
npm start
```

## API Endpoints

### `POST /calculate-multi-shape`

Calculate the area of multiple shapes. Example request:

```bash
curl -X POST http://localhost:3000/calculate-multi-shape \
  -H "Content-Type: application/json" \
  -d '{"shapes":[{"type":"rectangle","dimensions":{"length":10,"width":20}},{"type":"polygon","dimensions":{"points":[{"x":0,"y":0},{"x":4,"y":0},{"x":4,"y":3}]}},{"type":"circle","dimensions":{"radius":5},"isPool":true}],"wastagePercent":10}'
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

=======
 main
## Running Tests

Install dependencies and run the test suite with:

```bash
npm install
npm test
```

The tests use Jest and Supertest to verify the geometry helpers and Express endpoints.
 main
