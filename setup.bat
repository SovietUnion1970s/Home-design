@echo off
echo ==============================================
echo HomeDesign 3D - Setup ^& Start Script
echo ==============================================

IF NOT EXIST "client\.env" (
    echo [INFO] Copying client/.env.example to client/.env...
    copy "client\.env.example" "client\.env"
) ELSE (
    echo [OK] client/.env already exists.
)

IF NOT EXIST "server\.env" (
    echo [INFO] Copying server/.env.example to server/.env...
    copy "server\.env.example" "server\.env"
) ELSE (
    echo [OK] server/.env already exists.
)

echo.
echo [INFO] Environment files are ready.
echo [INFO] NOTE: Please open server/.env and add your GOOGLE_CLIENT_ID if you want Login to work.
echo.
echo Starting Docker Compose...
docker-compose up --build
