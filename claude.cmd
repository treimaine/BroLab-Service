@echo off
setlocal

rem Local shim so Claude Code works even when npm shim paths are missing.
set "CLAUDE_EXE=%CLAUDE_EXE%"

if not defined CLAUDE_EXE (
  if exist "%APPDATA%\npm\claude.cmd" (
    set "CLAUDE_EXE=%APPDATA%\npm\claude.cmd"
  )
)

if not defined CLAUDE_EXE (
  for /f "delims=" %%I in ('where claude.cmd 2^>nul') do (
    set "CLAUDE_EXE=%%I"
    goto :run_claude
  )
)

if not defined CLAUDE_EXE (
  for /f "delims=" %%I in ('where claude 2^>nul') do (
    set "CLAUDE_EXE=%%I"
    goto :run_claude
  )
)

if not exist "%CLAUDE_EXE%" (
  echo Claude Code CLI not found. Install it or ensure claude.cmd is on PATH.
  exit /b 1
)

:run_claude
"%CLAUDE_EXE%" %*
