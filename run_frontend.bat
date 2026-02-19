@echo off
cd frontend
if not exist node_modules (
    echo Installing dependencies...
    npm install
)
echo Starting frontend dev server...
npm run dev
pause
