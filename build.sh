#!/bin/bash
set -e

echo "Building frontend..."
cd app/frontend
npm install --no-audit --no-fund
npm run build
cd ../..

echo "Frontend build complete!" 