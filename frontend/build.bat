@echo off
echo Building Suraga Website...
echo.

echo Installing dependencies...
npm install

echo Building CSS with Tailwind...
npx tailwindcss -i ./src/styles/main.css -o ./dist/styles/main.css --minify

echo Building with Vite...
npm run build

echo Build complete!
echo.
echo The built files are in the dist/ directory
echo You can now deploy the dist/ folder to any static hosting service
echo.
pause