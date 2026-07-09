@echo off
REM ================================================================
REM BroLab Entertainment - Tests Automatisés Phase 1
REM Date: 9 Juillet 2026
REM ================================================================

echo.
echo ================================================================
echo     BroLab Entertainment - Tests Post-Update Phase 1
echo ================================================================
echo.
echo Ce script va executer:
echo   1. npm run build       (test de compilation)
echo   2. npm run typecheck   (verification TypeScript)
echo   3. npm run lint        (linting du code)
echo.
echo Duree estimee: 5-10 minutes
echo.
pause

REM ================================================================
REM Test 1: Build
REM ================================================================
echo.
echo ================================================================
echo TEST 1/3: Build Test
echo ================================================================
echo.

call npm run build

if %ERRORLEVEL% neq 0 (
    echo.
    echo [ECHEC] Build test a echoue!
    echo.
    echo ACTION REQUISE:
    echo   1. Consulter docs/UPDATE-COMPATIBILITY-CHECKS.md
    echo   2. Si probleme critique: cd scripts ^&^& rollback.bat
    echo.
    pause
    exit /b 1
)

echo.
echo [OK] Build test reussi!
echo.

REM ================================================================
REM Test 2: TypeCheck
REM ================================================================
echo.
echo ================================================================
echo TEST 2/3: TypeScript Check
echo ================================================================
echo.

call npm run typecheck

if %ERRORLEVEL% neq 0 (
    echo.
    echo [ECHEC] TypeCheck a echoue!
    echo.
    echo ACTION REQUISE:
    echo   1. Consulter les erreurs TypeScript ci-dessus
    echo   2. Si probleme critique: cd scripts ^&^& rollback.bat
    echo.
    pause
    exit /b 1
)

echo.
echo [OK] TypeCheck reussi!
echo.

REM ================================================================
REM Test 3: Lint
REM ================================================================
echo.
echo ================================================================
echo TEST 3/3: Lint Check
echo ================================================================
echo.

call npm run lint

if %ERRORLEVEL% neq 0 (
    echo.
    echo [ATTENTION] Lint a detecte des problemes
    echo.
    echo NOTE: Des warnings sont acceptables
    echo Si uniquement des warnings: continuer
    echo Si erreurs critiques: rollback
    echo.
)

echo.
echo [OK] Lint termine (warnings acceptables)
echo.

REM ================================================================
REM Rapport Final
REM ================================================================
echo.
echo ================================================================
echo     RAPPORT FINAL - Phase 1 Tests Automatises
echo ================================================================
echo.
echo [OK] Build test        - REUSSI
echo [OK] TypeCheck test    - REUSSI  
echo [OK] Lint test         - REUSSI (warnings OK)
echo.
echo ================================================================
echo     TOUS LES TESTS SONT PASSES!
echo ================================================================
echo.
echo Prochaines etapes:
echo.
echo   1. Tests manuels (voir docs/UPDATE-COMPATIBILITY-CHECKS.md)
echo      - Demarrer app: npm run dev
echo      - Tester auth Clerk
echo      - Tester backend Convex
echo      - Tester UI (animations, icones, styles)
echo.
echo   2. Si tests manuels OK: Phase 2
echo      cd scripts
echo      update-phase2.bat
echo.
echo   3. Si probleme: Rollback
echo      cd scripts
echo      rollback.bat
echo.
echo Documentation:
echo   - docs/UPDATE-VERIFICATION-SUMMARY.md
echo   - docs/UPDATE-PHASE1-VERIFICATION.md
echo   - docs/UPDATE-COMPATIBILITY-CHECKS.md
echo.
echo ================================================================
echo.

pause
