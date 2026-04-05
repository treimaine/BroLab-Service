@echo off
setlocal

rem Prefer an explicit override, then known install locations, then PATH.
set "CODEX_EXE=%CODEX_EXE%"
if /I "%CODEX_EXE%"=="%~f0" set "CODEX_EXE="

if not defined CODEX_EXE (
  if exist "%LOCALAPPDATA%\Programs\OpenAI\codex.exe" (
    set "CODEX_EXE=%LOCALAPPDATA%\Programs\OpenAI\codex.exe"
  )
)

if not defined CODEX_EXE (
  if exist "%USERPROFILE%\.vscode\extensions\openai.chatgpt-26.325.31654-win32-x64\bin\windows-x86_64\codex.exe" (
    set "CODEX_EXE=%USERPROFILE%\.vscode\extensions\openai.chatgpt-26.325.31654-win32-x64\bin\windows-x86_64\codex.exe"
  )
)

if not defined CODEX_EXE (
  for /f "delims=" %%I in ('where codex 2^>nul') do (
    set "CODEX_EXE=%%I"
    goto :run_codex
  )
)

if not defined CODEX_EXE (
  for /f "delims=" %%I in ('where codex.cmd 2^>nul') do (
    set "CODEX_EXE=%%I"
    goto :run_codex
  )
)

if not defined CODEX_EXE (
  echo Codex CLI not found. Install the OpenAI extension or ensure codex.exe is on PATH.
  exit /b 1
)

if not exist "%CODEX_EXE%" (
  set "CODEX_EXE="
  for /f "delims=" %%I in ('where codex.exe 2^>nul') do (
    set "CODEX_EXE=%%I"
    goto :run_codex
  )
)

if not exist "%CODEX_EXE%" (
  set "CODEX_EXE="
  for /f "delims=" %%I in ('where codex 2^>nul') do (
    set "CODEX_EXE=%%I"
    goto :run_codex
  )
)

if not exist "%CODEX_EXE%" (
  echo Codex CLI not found. Install the OpenAI extension or ensure codex.exe is on PATH.
  exit /b 1
)

 :run_codex
"%CODEX_EXE%" %*
