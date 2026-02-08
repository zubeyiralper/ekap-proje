@echo off
cd /d "%~dp0"
echo Insaat Analiz Sunucusu ve Uygulamasi Baslatiliyor...

:: Eski sunucu pencerelerini kapat (cakisma olmamasi icin)
taskkill /FI "WINDOWTITLE eq InsaatAI_Server" /F >nul 2>&1

:: Sunucuyu minimize edilmis pencerede baslat
start /min "InsaatAI_Server" cmd /c "cd server && node server.js"

:: 2 saniye bekle
timeout /t 2 >nul

:: Uygulamayi ac (index.html guncel versiyondur)
start index.html

exit
