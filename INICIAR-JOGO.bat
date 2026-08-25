@echo off
setlocal
cd /d "%~dp0"
set PORT=8000
where py >nul 2>nul
if %errorlevel%==0 (
  start "Crash Fan Game Server" /min py -m http.server %PORT% --bind 127.0.0.1
  timeout /t 1 /nobreak >nul
  start "" http://127.0.0.1:%PORT%/
  exit /b
)
where python >nul 2>nul
if %errorlevel%==0 (
  start "Crash Fan Game Server" /min python -m http.server %PORT% --bind 127.0.0.1
  timeout /t 1 /nobreak >nul
  start "" http://127.0.0.1:%PORT%/
  exit /b
)
echo Python nao foi encontrado.
echo Instale Python ou use a extensao Live Server no VS Code.
pause
