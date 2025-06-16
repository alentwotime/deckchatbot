# Setup Troubleshooting

This guide addresses common issues when starting the Deck Chatbot locally.

## 1. Missing or Misnamed Database File
If the server logs show an error such as:
```
Error: Cannot open file ./sqlite.json
```
ensure the expected JSON or SQLite file exists. This project normally uses `deckchatbot.db`. If you see the above message, check that your database file name matches the path used in your start command. Rename or create the file if needed.

## 2. Local Domain Configuration
The app listens on port 3000 by default. Browsing to a custom domain like `deckchatbot.local` requires mapping that name to `127.0.0.1` in your hosts file and including the port number:
```
http://deckchatbot.local:3000
```
If you use Localtunnel, open the URL printed in the terminal, typically `https://<subdomain>.loca.lt`.

Fixing the file path and using the correct host address should resolve blank pages or startup errors.

