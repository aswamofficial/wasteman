@echo off
setlocal

echo ============================================
echo   Wasteman - Starting Servers
echo ============================================
echo.

REM --- 1. Start MariaDB on port 3307 (if not already running) ---
echo [1/3] Checking MariaDB (port 3307)...
netstat -ano | findstr ":3307" | findstr "LISTENING" >nul
if %errorlevel%==0 (
    echo       Already running.
) else (
    echo       Starting MariaDB...
    start "Wasteman MariaDB" /min "C:\xampp2\mysql\bin\mysqld.exe" --defaults-file="C:\xampp2\mysql\bin\my.ini"
    timeout /t 4 /nobreak >nul
)

REM --- 2. Check Apache (port 80) - must be started via XAMPP Control Panel ---
echo [2/3] Checking Apache (port 80)...
netstat -ano | findstr ":80 " | findstr "LISTENING" >nul
if %errorlevel%==0 (
    echo       Already running.
) else (
    echo       NOT RUNNING - please start Apache via XAMPP Control Panel.
    echo       Opening XAMPP Control Panel...
    start "" "C:\xampp2\xampp-control.exe"
    timeout /t 3 /nobreak >nul
)

REM --- 3. Start the Ionic/Vite dev server on port 5299 ---
echo [3/3] Checking Wasteman App server (port 5299)...
netstat -ano | findstr ":5299" | findstr "LISTENING" >nul
if %errorlevel%==0 (
    echo       Already running.
) else (
    echo       Starting dev server...
    start "Wasteman App Server" cmd /k "cd /d C:\xampp2\htdocs\wastenotify\wastenotify-app && npm run dev -- --host --port 5299"
    timeout /t 5 /nobreak >nul
)

echo.
echo ============================================
echo   Ready!
echo   Screen index: http://localhost:5299/screens
echo   App home:     http://localhost:5299/home
echo   Admin:        http://localhost:5299/admin
echo   API:          http://localhost/wastenotify/wastenotify-api/public/api
echo   API health check: /api/health
echo ============================================
echo.

start "" "http://localhost:5299/screens"

endlocal
