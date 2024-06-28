rem Windows
@echo off
echo Windows: Opening Google Chrome with no CORS.
taskkill /F /IM "chrome.exe"
set location=%userprofile%/.chrome-rve-editor"
mkdir %location%
start chrome.exe --user-data-dir=%location% --disable-web-security
