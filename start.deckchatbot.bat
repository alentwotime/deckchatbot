@echo off
title DeckChatbot Launcher 🚀
echo Starting DeckChatbot server...

REM Navigate to the project folder
cd /d "%~dp0"

REM Start the server in a new terminal window
start "Server" cmd /k "npx nodemon server.cjs"

REM Wait for the server to boot up
timeout /t 3 >nul

echo Launching LocalTunnel on port 3000 with subdomain 'deckchatbot'...
start "Tunnel" cmd /k "lt --port 3000 --subdomain deckchatbot > .ltlog.txt 2>&1"
REM Wait for the LocalTunnel URL to appear in the log file (up to 30 seconds)
setlocal enabledelayedexpansion
set LTURL_FOUND=
for /l %%i in (1,1,30) do (
	findstr /r /c:"https://.*\.loca\.lt" .ltlog.txt > .lturl.txt && (
		set LTURL_FOUND=1
		goto :LTURL_READY
	)
	timeout /t 1 >nul
)
:LTURL_READY
endlocal

REM Wait for tunnel to initialize
timeout /t 5 >nul

REM Get the actual LocalTunnel URL from the Tunnel window and open it in browser
for /f "tokens=*" %%i in ('powershell -Command "Get-Content .lturl.txt -Raw" 2^>nul') do set LTURL=%%i
if defined LTURL (
	echo ✅ All systems go. You can now test the DeckChatbot in your browser.
	if not defined NO_PAUSE pause
) else (
	echo ❌ Could not determine LocalTunnel URL. Please open it manually.
	if not defined NO_PAUSE pause
)
echo ✅ All systems go. You can now test the DeckChatbot in your browser.
