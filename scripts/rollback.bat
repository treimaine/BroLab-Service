@echo off
echo ===============================================
echo BroLab Entertainment - ROLLBACK
echo ===============================================
echo.
echo ⚠️  WARNING: This will restore package files to backup
echo.
echo Press CTRL+C to cancel, or
pause

echo.
echo [1/4] Restoring package.json...
copy /Y package.json.backup-20260709 package.json
if %ERRORLEVEL% NEQ 0 (
    echo ❌ ERROR: Could not restore package.json
    exit /b 1
)
echo ✅ package.json restored

echo [2/4] Restoring package-lock.json...
copy /Y package-lock.json.backup-20260709 package-lock.json
if %ERRORLEVEL% NEQ 0 (
    echo ❌ ERROR: Could not restore package-lock.json
    exit /b 1
)
echo ✅ package-lock.json restored

echo [3/4] Removing node_modules...
if exist node_modules (
    rmdir /S /Q node_modules
    echo ✅ node_modules removed
) else (
    echo ℹ️  node_modules already removed
)

echo [4/4] Reinstalling packages...
call npm install
if %ERRORLEVEL% NEQ 0 (
    echo ❌ ERROR: npm install failed
    exit /b 1
)
echo ✅ Packages reinstalled

echo.
echo ===============================================
echo ✅ ROLLBACK COMPLETE
echo ===============================================
echo.
echo Packages restored to previous versions.
echo Run 'npm run build' to verify everything works.
echo.

pause
