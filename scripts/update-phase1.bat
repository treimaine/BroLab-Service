@echo off
echo ===============================================
echo BroLab Entertainment - Phase 1 Updates
echo ===============================================
echo.

echo [1/5] Updating Core Stack (Next.js, React)...
call npm install next@16.2.10 react@19.2.7 react-dom@19.2.7
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Core stack update failed
    exit /b 1
)
echo ✅ Core stack updated
echo.

echo [2/5] Updating Auth and Backend (Clerk, Convex)...
call npm install @clerk/nextjs@7.5.15 convex@1.42.1
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Auth/Backend update failed
    exit /b 1
)
echo ✅ Auth and Backend updated
echo.

echo [3/5] Updating Payments and Email (Stripe, Resend)...
call npm install stripe@22.3.0 resend@6.17.2
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Payments/Email update failed
    exit /b 1
)
echo ✅ Payments and Email updated
echo.

echo [4/5] Updating UI and Animations...
call npm install framer-motion@12.42.2 lucide-react@1.24.0 tailwindcss@4.3.2 @tailwindcss/postcss@4.3.2
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: UI/Animations update failed
    exit /b 1
)
echo ✅ UI and Animations updated
echo.

echo [5/5] Updating State Management and Utils...
call npm install zustand@5.0.14 dotenv@17.4.2
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: State/Utils update failed
    exit /b 1
)
echo ✅ State Management and Utils updated
echo.

echo ===============================================
echo ✅ Phase 1 Complete!
echo ===============================================
echo.
echo Next steps:
echo 1. Run: npm run build
echo 2. Run: npm run typecheck
echo 3. Run: npm run lint
echo 4. Test authentication (Clerk)
echo 5. Test backend (Convex)
echo 6. Test UI
echo.

pause
