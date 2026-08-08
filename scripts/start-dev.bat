@echo off
echo Starting Tekurious Development Environment...

echo Starting Docker containers...
docker-compose up -d

echo Waiting for PostgreSQL to be ready...
:wait_loop
docker exec tekurious_postgres pg_isready -U postgres >nul 2>&1
if errorlevel 1 (
    timeout /t 1 /nobreak >nul
    goto wait_loop
)

echo PostgreSQL is ready!

echo Running database migrations...
cd apps\tekurious_erp
call npx prisma migrate dev

echo Development environment is ready!
echo.
echo PgAdmin: http://localhost:5050
echo    Email: admin@tekurious.com
echo    Password: admin
echo.
echo Run 'npm run dev' to start the application
