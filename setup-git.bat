@echo off
echo Setting up Git repository for Suraga Website...
echo.

cd "C:\Users\Mohamed Daoud\.gemini\antigravity\scratch\suraga-website"

echo Current directory: %CD%
echo.

echo Initializing Git repository...
git init

echo Adding all files...
git add .

echo Committing changes...
git commit -m "Overhaul: remove Tailwind CDN + Three.js, fix CSP/SEO, add security headers"

echo Setting up remote origin...
git remote add origin https://github.com/Suraga851/suraga-website.git

echo Setting main branch...
git branch -M main

echo Pushing to GitHub...
git push -u origin main

echo.
echo Setup complete! You can now connect this repository to Vercel for deployment.
echo.
pause