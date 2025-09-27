# MoolaBuddy APK Build Script
# This script builds the APK files for the MoolaBuddy application

# Set Java environment to use Android Studio's Java 21
$env:JAVA_HOME = "C:\Program Files\Android\Android Studio\jbr"

Write-Host "Building MoolaBuddy web application..." -ForegroundColor Green
npm run build

Write-Host "Syncing with Capacitor..." -ForegroundColor Green
npx cap sync

Write-Host "Building Android APKs..." -ForegroundColor Green
cd android

Write-Host "Building Debug APK..." -ForegroundColor Yellow
.\gradlew.bat assembleDebug

Write-Host "Building Release APK..." -ForegroundColor Yellow
.\gradlew.bat assembleRelease

cd ..

Write-Host ""
Write-Host "Build completed successfully!" -ForegroundColor Green
Write-Host "APK files are located at:" -ForegroundColor Cyan
Write-Host "Debug APK:   android\app\build\outputs\apk\debug\app-debug.apk" -ForegroundColor White
Write-Host "Release APK: android\app\build\outputs\apk\release\app-release.apk" -ForegroundColor White