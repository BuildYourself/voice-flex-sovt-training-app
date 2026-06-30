@echo off
setlocal EnableExtensions

set "NODE_DIR=C:\Program Files\nodejs"
set "NPM_GLOBAL=%APPDATA%\npm"

echo Voice Flex - Node.js PATH repair
echo.

if not exist "%NODE_DIR%\node.exe" (
  echo ERROR: Node.js was not found at "%NODE_DIR%\node.exe".
  echo Reinstall Node.js LTS from https://nodejs.org/ and keep "Add to PATH" checked.
  pause
  exit /b 1
)

echo Found Node.js:
"%NODE_DIR%\node.exe" -v
echo.

for /f "tokens=2,*" %%A in ('reg query HKCU\Environment /v Path 2^>nul') do set "USER_PATH=%%B"

if not defined USER_PATH set "USER_PATH="

echo %USER_PATH% | find /I "%NODE_DIR%" >nul
if errorlevel 1 (
  set "USER_PATH=%USER_PATH%;%NODE_DIR%"
)

echo %USER_PATH% | find /I "%NPM_GLOBAL%" >nul
if errorlevel 1 (
  set "USER_PATH=%USER_PATH%;%NPM_GLOBAL%"
)

reg add HKCU\Environment /v Path /t REG_EXPAND_SZ /d "%USER_PATH%" /f >nul

echo.
echo User PATH updated with:
echo - %NODE_DIR%
echo - %NPM_GLOBAL%
echo.
echo Close and reopen your terminal/Codex app, then run:
echo node -v
echo npm -v
echo npm run build
echo.
pause
