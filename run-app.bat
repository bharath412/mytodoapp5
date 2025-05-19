@echo off
echo Starting full-stack application...

echo ======================================
echo Building and starting backend...
echo ======================================
cd backend
call mvn clean package
if %ERRORLEVEL% neq 0 (
    echo Maven build failed!
    pause
    exit /b %ERRORLEVEL%
)

start cmd /k "echo Starting Spring Boot application... && mvn spring-boot:run"

echo ======================================
echo Installing and starting frontend...
echo ======================================
cd ..\frontend
call npm install
if %ERRORLEVEL% neq 0 (
    echo NPM install failed!
    pause
    exit /b %ERRORLEVEL%
)

start cmd /k "echo Starting Angular application... &&  ng serve"

echo ======================================
echo Application startup initiated!
echo ======================================
echo Backend will be available at: http://localhost:8080
echo Frontend will be available at: http://localhost:4200
echo ======================================

cd ..
