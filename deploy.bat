@echo off
echo 🚀 FreeTogether Deployment Helper
echo ==================================
echo.

REM Check if we're in the right directory
if not exist "DEPLOYMENT.md" (
    echo ❌ Please run this script from the project root directory
    pause
    exit /b 1
)

echo 📋 Pre-deployment Checklist:
echo.

REM Check for environment files
echo 🔍 Checking environment files...

if not exist "backend\.env" (
    echo ⚠️  backend\.env not found
    echo    Create it with your production environment variables
    echo    See DEPLOYMENT.md for required variables
) else (
    echo ✅ backend\.env found
)

if not exist "frontend\.env" (
    echo ⚠️  frontend\.env not found
    echo    Create it with your Firebase and API configuration
    echo    See DEPLOYMENT.md for required variables
) else (
    echo ✅ frontend\.env found
)

echo.
echo 🔧 Testing local builds...

REM Test frontend build
echo Testing frontend build...
cd frontend
call npm run build >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Frontend builds successfully
    rmdir /s /q dist >nul 2>&1
) else (
    echo ❌ Frontend build failed
    echo    Check your environment variables and dependencies
    cd ..
    pause
    exit /b 1
)
cd ..

echo.
echo ✅ All checks passed!
echo.
echo 📝 Next steps:
echo 1. Push your code to GitHub
echo 2. Deploy backend to Railway (see DEPLOYMENT.md)
echo 3. Deploy frontend to Vercel (see DEPLOYMENT.md)
echo 4. Update CORS settings with your production URLs
echo 5. Test your live application
echo.
echo 📖 See DEPLOYMENT.md for detailed instructions
echo.
pause 