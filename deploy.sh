#!/bin/bash

echo "🚀 FreeTogether Deployment Helper"
echo "=================================="

# Check if we're in the right directory
if [ ! -f "DEPLOYMENT.md" ]; then
    echo "❌ Please run this script from the project root directory"
    exit 1
fi

echo "📋 Pre-deployment Checklist:"
echo ""

# Check for environment files
echo "🔍 Checking environment files..."

if [ ! -f "backend/.env" ]; then
    echo "⚠️  backend/.env not found"
    echo "   Create it with your production environment variables"
    echo "   See DEPLOYMENT.md for required variables"
else
    echo "✅ backend/.env found"
fi

if [ ! -f "frontend/.env" ]; then
    echo "⚠️  frontend/.env not found"
    echo "   Create it with your Firebase and API configuration"
    echo "   See DEPLOYMENT.md for required variables"
else
    echo "✅ frontend/.env found"
fi

echo ""
echo "🔧 Testing local builds..."

# Test backend
echo "Testing backend..."
cd backend
if python -c "from app import create_app; app = create_app(); print('✅ Backend imports successfully')"; then
    echo "✅ Backend configuration is valid"
else
    echo "❌ Backend has configuration issues"
    cd ..
    exit 1
fi
cd ..

# Test frontend build
echo "Testing frontend build..."
cd frontend
if npm run build > /dev/null 2>&1; then
    echo "✅ Frontend builds successfully"
    rm -rf dist  # Clean up test build
else
    echo "❌ Frontend build failed"
    echo "   Check your environment variables and dependencies"
    cd ..
    exit 1
fi
cd ..

echo ""
echo "✅ All checks passed!"
echo ""
echo "📝 Next steps:"
echo "1. Push your code to GitHub"
echo "2. Deploy backend to Railway (see DEPLOYMENT.md)"
echo "3. Deploy frontend to Vercel (see DEPLOYMENT.md)"
echo "4. Update CORS settings with your production URLs"
echo "5. Test your live application"
echo ""
echo "📖 See DEPLOYMENT.md for detailed instructions" 