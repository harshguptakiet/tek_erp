@echo off
echo ========================================
echo   Tekurious ERP - Development Startup
echo ========================================
echo.

echo [1/4] Checking dependencies...
if not exist "node_modules\" (
    echo Installing dependencies...
    call npm install
) else (
    echo Dependencies already installed
)

echo.
echo [2/4] Generating Prisma Client...
call npm run prisma:generate

echo.
echo [3/4] Starting Backend Server on port 3333...
echo.
echo Backend will be available at: http://localhost:3333/api/v1
echo.
start "Tekurious Backend" cmd /k "npm run dev"

timeout /t 5

echo.
echo [4/4] Starting Frontend Server on port 3000...
echo.
echo Frontend will be available at: http://localhost:3000
echo.
start "Tekurious Frontend" cmd /k "npm run web"

echo.
echo ========================================
echo   Startup Complete!
echo ========================================
echo.
echo Backend:  http://localhost:3333/api/v1
echo Frontend: http://localhost:3000
echo.
echo Test connectivity: http://localhost:3000/test/api
echo.
echo Press any key to continue...
pause > nul
