@echo off
setlocal EnableExtensions

set "PROJECT_DIR=%~dp0"
set "TARGET_DIR=%PROJECT_DIR%public\images\session"
set "DOWNLOADS=%USERPROFILE%\Downloads"

echo Voice Flex - copy session visual demo images
echo.

if not exist "%TARGET_DIR%" mkdir "%TARGET_DIR%"

if not exist "%DOWNLOADS%\3.png" goto missing
if not exist "%DOWNLOADS%\4.png" goto missing
if not exist "%DOWNLOADS%\5.png" goto missing
if not exist "%DOWNLOADS%\6.png" goto missing

copy /Y "%DOWNLOADS%\3.png" "%TARGET_DIR%\easy-bubbles-step-1.png" >nul
copy /Y "%DOWNLOADS%\4.png" "%TARGET_DIR%\easy-bubbles-step-2.png" >nul
copy /Y "%DOWNLOADS%\6.png" "%TARGET_DIR%\easy-bubbles-step-3.png" >nul
copy /Y "%DOWNLOADS%\5.png" "%TARGET_DIR%\soft-mmm-step-3.png" >nul

echo Done. Images copied:
echo - 3.png - easy-bubbles-step-1.png
echo - 4.png - easy-bubbles-step-2.png
echo - 6.png - easy-bubbles-step-3.png
echo - 5.png - soft-mmm-step-3.png
echo.
pause
exit /b 0

:missing
echo ERROR: Expected files were not found in "%DOWNLOADS%".
echo Required files: 3.png, 4.png, 5.png, 6.png
echo.
pause
exit /b 1
