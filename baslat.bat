@echo off
cd /d "%~dp0"
echo Insaat Analiz Sunucusu Baslatiliyor...
:: Sunucuyu minimize edilmis pencerede baslat
start /min "InsaatAI_Server" cmd /c "cd server && node server.js"
:: 2 saniye bekle ki sunucu ayaga kalksin
timeout /t 2 >nul
:: Siteyi varsayilan tarayicida ac
start index.html
exit
