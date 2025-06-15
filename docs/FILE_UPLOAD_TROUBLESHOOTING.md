# File Upload Troubleshooting Guide

This guide provides steps to ensure files uploaded through the chatbot UI are processed correctly.

## 1. Verify the client request
- Use an HTML `<form>` with `enctype="multipart/form-data"` and `method="POST"`, or
- Build a `FormData` object in JavaScript and let the browser set the `Content-Type` header automatically.

## 2. Parse multipart data on the server
- Express does not handle file uploads by default. Use middleware such as `multer`:
  ```javascript
  const multer = require('multer');
  const upload = multer({ dest: 'uploads/' });

  app.post('/chatbot', upload.single('uploadedFile'), (req, res) => {
    console.log(req.file);
    res.json({ message: 'File uploaded', filename: req.file.originalname });
  });
  ```

## 3. Keep field names consistent
- The key used in `formData.append('uploadedFile', file)` or the `<input name="uploadedFile" />` must match the name in `upload.single('uploadedFile')`.

## 4. Update the UI on success
- Handle the server's JSON response on the client and display the uploaded file name or preview.

## 5. Debugging tips
- Check the browser's network panel to confirm the file is included in the request.
- Log `req.file` on the server to ensure the file arrived.
