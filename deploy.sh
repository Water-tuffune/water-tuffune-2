#!/usr/bin/env bash
set -euo pipefail

if [ "${1:-}" = "--help" ] || [ "${1:-}" = "-h" ]; then
  echo "Water Tuffune - Deployment Script"
  echo ""
  echo "Usage: ./deploy.sh [options]"
  echo ""
  echo "Options:"
  echo "  --docker     Build and deploy using Docker"
  echo "  --help, -h   Show this help message"
  echo ""
  echo "Without options, deploys directly using Node.js."
  exit 0
fi

if [ "${1:-}" = "--docker" ]; then
  echo "==> Building Docker image..." 
  docker compose build

  echo "==> Starting container..."
  docker compose up -d

  echo "==> App running at http://localhost:5000"
  exit 0
fi

echo "==> Installing frontend dependencies..."
cd frontend && npm install && cd ..

echo "==> Building frontend..."
cd frontend && npm run build && cd ..

echo "==> Installing backend dependencies..."
cd backend && npm install && cd ..

if [ ! -f "backend/.env" ]; then
  echo "==> Creating .env file..."
  cp .env.example backend/.env
  echo "    WARNING: Update JWT_SECRET in backend/.env for production!"
fi

echo "==> Starting server..."
cd backend && node server.js
