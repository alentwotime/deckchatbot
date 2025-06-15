@echo off
title DeckChatbot Launcher 🚀
echo Starting DeckChatbot server...

REM Navigate to the project folder
cd /d C:\Users\aklin\deckchatbot

REM Start the server in a new terminal window
start "Server" cmd /k "nodemon server.cjs"

REM Wait for the server to boot up
timeout /t 3 >nul

echo Launching LocalTunnel on port 3000 with subdomain 'deckchatbot'...
start "Tunnel" cmd /k "lt --port 3000 --subdomain deckchatbot"

REM Wait for tunnel to initialize
timeout /t 5 >nul

REM Open chatbot in browser
start https://deckchatbot.loca.lt

echo ✅ All systems go. You can now test the DeckChatbot in your browser.
pause
