@echo off
echo ===============================================
echo BroLab Entertainment - Post-Update Tests
echo ===============================================
echo.

set ERROR_COUNT=0

echo [1/5] Running Build Test...
call npm run build
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Build FAILED
    set /a ERROR_COUNT+=1
) else (
    echo ✅ Build passed
)
echo.

echo [2/5] Running Type Check...
call npm run typecheck
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Type check FAILED
    set /a ERROR_COUNT+=1
) else (
    echo ✅ Type check passed
)
echo.

echo [3/5] Running Lint...
call npm run lint
if %ERRORLEVEL% NEQ 0 (
    echo ⚠️  Lint has warnings (may be acceptable)
) else (
    echo ✅ Lint passed
)
echo.

echo [4/5] Running Unit Tests...
call npm run test:unit
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Unit tests FAILED
    set /a ERROR_COUNT+=1
) else (
    echo ✅ Unit tests passed
)
echo.

echo [5/5] Running Security Audit...
call npm audit --production
if %ERRORLEVEL% NEQ 0 (
    echo ⚠️  Security issues found (review required)
) else (
    echo ✅ No security issues
)
echo.

echo ===============================================
echo Test Summary
echo ===============================================
if %ERROR_COUNT% EQU 0 (
    echo ✅ All critical tests passed!
    echo.
    echo Next steps:
    echo 1. Test authentication manually
    echo 2. Test Convex queries manually
    echo 3. Test UI manually
    echo 4. Deploy to staging
) else (
    echo ❌ %ERROR_COUNT% test(s) failed
    echo.
    echo ROLLBACK RECOMMENDED
    echo Run: scripts\rollback.bat
)
echo.

pause
