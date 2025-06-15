@echo off
title DeckChatbot Launcher 🚀
echo Starting DeckChatbot server...

REM Navigate to the project folder
cd /d "%~dp0"

REM Start the server in a new terminal window
REM Prefer local nodemon if available, fallback to npx
if exist node_modules\.bin\nodemon (
	start "Server" cmd /k "node_modules\.bin\nodemon server.cjs"
) else (
	start "Server" cmd /k "npx nodemon server.cjs"
)

set "LT_SUBDOMAIN=deckchatbot"
echo Launching LocalTunnel on port 3000 with subdomain '%LT_SUBDOMAIN%'...
start "Tunnel" cmd /k "lt --port 3000 --subdomain %LT_SUBDOMAIN% > .ltlog.txt 2>&1"

REM Wait for the server to boot up
timeout /t 3 >nul

REM Wait for the LocalTunnel URL to appear in the log file (up to 30 seconds)
setlocal enabledelayedexpansion
set LTURL_FOUND=
for /l %%i in (1,1,30) do (
	findstr /r /c:"https://[a-zA-Z0-9\-]\+\.loca\.lt" .ltlog.txt > .lturl.txt 2>nul && (
		set LTURL_FOUND=1
		goto :LTURL_READY
	)
	timeout /t 1 >nul
)

:LTURL_READY
if defined LTURL_FOUND (
	for /f "usebackq tokens=1" %%i in (`findstr /r /c:"https://[a-zA-Z0-9\-]\+\.loca\.lt" .lturl.txt`) do set LTURL=%%i
	if defined LTURL (
		echo ✅ All systems go. LocalTunnel URL: !LTURL!
	) else (
		echo ❌ Could not extract LocalTunnel URL from log.
	)
) else (
	echo ❌ LocalTunnel URL not found in log file.
)
endlocal

REM If NO_PAUSE is not defined, pause at the end for user to see output.
if not defined NO_PAUSE pause
