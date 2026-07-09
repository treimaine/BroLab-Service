@echo off
echo ===============================================
echo BroLab Entertainment - Phase 2 Updates
echo ===============================================
echo.

echo [1/3] Updating Testing Tools...
call npm install --save-dev vitest@4.1.10 @vitest/coverage-v8@4.1.10 jsdom@29.1.1 @playwright/test@1.61.1
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Testing tools update failed
    exit /b 1
)
echo ✅ Testing tools updated
echo.

echo [2/3] Updating Linting Tools...
call npm install --save-dev eslint@10.6.0 typescript-eslint@8.63.0 eslint-plugin-react-hooks@7.1.1 eslint-config-next@16.2.10 @next/eslint-plugin-next@16.2.10
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Linting tools update failed
    exit /b 1
)
echo ✅ Linting tools updated
echo.

echo [3/3] Updating Types and Build Tools...
call npm install --save-dev @types/node@25.9.5 @types/react@19.2.17 @vitejs/plugin-react@6.0.3
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Types/Build tools update failed
    exit /b 1
)
echo ✅ Types and Build tools updated
echo.

echo ===============================================
echo ✅ Phase 2 Complete!
echo ===============================================
echo.
echo Next steps:
echo 1. Run: npm run lint
echo 2. Run: npm run test
echo 3. Deploy to staging
echo.

pause
