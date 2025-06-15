# Measurement Extraction Logic

This project extracts deck measurements from uploaded drawings using OCR and basic shape detection.

1. **Image Processing**
   - `/upload-measurements` accepts an image file via `multer`.
   - [Tesseract.js](https://github.com/naptha/tesseract.js/) is used to recognize numeric text from the uploaded image.

2. **Number Parsing**
   - Extracted text is cleaned and parsed in [`utils/extract.js`](../utils/extract.js).
   - Only numeric values up to 500 are kept to avoid erroneous readings.

3. **Shape Assembly**
   - Numbers are grouped into coordinate pairs representing vertices.
   - If the text includes the word `pool`, numbers after the midpoint are treated as a cutout area.

4. **Area and Perimeter**
   - Coordinates are passed to functions in [`utils/geometry.js`](../utils/geometry.js) to calculate:
     - Total deck area
     - Cutout (pool) area
     - Usable deck surface (total minus cutouts)
     - Perimeter for railing footage

5. **Storage**
   - Results are saved via `memory.addMeasurement` so they can be recalled later.

Any errors during extraction return a consistent JSON structure with an `errors` array for easier handling by the chatbot frontend.
