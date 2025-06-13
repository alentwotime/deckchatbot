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

The app runs at `http://localhost:3000`.

## Logging

Winston logs requests and errors to `logs/app.log` and to STDOUT. Adjust `LOG_LEVEL` in `.env` to control verbosity.

## API Endpoints

### `POST /calculate-multi-shape`
Calculate the area of multiple shapes.

### `POST /upload-measurements`
Upload an image containing measurements. OCR is used to extract points and compute deck area.

### `POST /digitalize-drawing`
Upload a photo of a hand-drawn deck. The image is vectorized and OCR is run to detect coordinate pairs. The response includes an SVG along with any detected points and calculated area.

### `POST /chatbot`
General chat endpoint.

## Testing

Run the test suite with:
```bash
npm test
```
