# deckchatbot
AI-powered chatbot for deck sales and quoting automation.

 codex/clean-merge-remnants-and-files
## Logging

Winston logs requests and errors to `logs/app.log` and to STDOUT. Adjust the
`LOG_LEVEL` environment variable (e.g. `info`, `debug`) to control verbosity.
## Setup

=======
## Installation
 main
```bash
npm install
```

codex/decide-necessity-of-setup-files-and-update-docs
The previous `setup.sh` and `run_setup.sh` scripts have been removed. Install
dependencies directly with `npm install`.

Copy `.env.example` to `.env` and set your `OPENAI_API_KEY` before running the server.
=======
## Environment Variables
Copy `.env.example` to `.env` and set your keys:
main

```
OPENAI_API_KEY=your-api-key
LOG_LEVEL=info
```

## Running the Server
```bash
npm start
```

## Logging
Winston logs requests and errors to `logs/app.log` and to STDOUT. Adjust `LOG_LEVEL` to control verbosity.

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

 codex/clean-merge-remnants-and-files
## Running Tests

=======
## Testing
 main
Install dependencies and run the test suite with:
```bash
npm install
npm test
```

The tests use Jest and Supertest to verify the geometry helpers and Express endpoints.
