@echo off
echo Starting E-commerce Website...

REM Change to the D: drive
D:

REM Create temp directory on D: if it doesn't exist
if not exist D:\temp mkdir D:\temp

REM Set environment variables to use D: drive for temporary files
set TEMP=D:\temp
set TMP=D:\temp
set TMPDIR=D:\temp

REM Set npm cache to D: drive
set npm_config_cache=D:\temp\npm-cache

REM Set Node.js environment variables
set NODE_PATH=D:\temp\node_modules
set NODE_OPTIONS=--max-old-space-size=4096

REM Navigate to the project directory
cd D:\CodeProjects\ecommerce-website

echo Checking system Node.js version...
C:\Windows\System32\cmd.exe /c node -v > D:\temp\node_version.txt
set /p SYSTEM_NODE_VERSION=<D:\temp\node_version.txt
echo System Node.js version: %SYSTEM_NODE_VERSION%

REM Use the system Node.js version (v22.14.0) which is compatible
echo Using system Node.js from C: drive...
set PATH=C:\Program Files\nodejs;%PATH%

REM Verify we're using the correct Node.js version
echo Verifying Node.js version:
node -v

REM Create a local .npmrc file to ensure npm uses D: drive
echo cache=D:\temp\npm-cache > .npmrc
echo tmp=D:\temp >> .npmrc

REM Run the development server with the compatible Node.js version
echo Starting development server...
call npm run dev

REM If the server stops, keep the window open
echo.
echo The application has stopped.
pause