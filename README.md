# deckchatbot
AI-powered chatbot for deck sales and quoting automation.

## Setup

```bash
npm install
```

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
