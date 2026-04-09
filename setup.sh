#!/bin/bash
echo "=============================================="
echo "HomeDesign 3D - Setup & Start Script"
echo "=============================================="

if [ ! -f "client/.env" ]; then
    echo "[INFO] Copying client/.env.example to client/.env..."
    cp client/.env.example client/.env
else
    echo "[OK] client/.env already exists."
fi

if [ ! -f "server/.env" ]; then
    echo "[INFO] Copying server/.env.example to server/.env..."
    cp server/.env.example server/.env
else
    echo "[OK] server/.env already exists."
fi

echo ""
echo "[INFO] Environment files are ready."
echo "[INFO] NOTE: Please open server/.env and add your GOOGLE_CLIENT_ID if you want Login to work."
echo ""
echo "Starting Docker Compose..."
docker-compose up --build
