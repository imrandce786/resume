@echo off
setlocal EnableExtensions EnableDelayedExpansion

REM Usage:
REM 1. Put this file inside any Git repository and double-click it.
REM 2. Or drag a Git repository folder onto this BAT file.
REM 3. Or run: universal-git-push-fixed.bat "C:\path\to\repository"

if not "%~1"=="" (
    set "REPO=%~1"
) else (
    set "REPO=%~dp0"
)

cd /d "%REPO%" 2>nul
if errorlevel 1 (
    echo ERROR: Cannot open folder: %REPO%
    goto :failed
)

echo ========================================
echo        Universal One-Click Git Push
echo ========================================
echo Repository: %CD%
echo.

where git >nul 2>&1
if errorlevel 1 (
    echo ERROR: Git is not installed or not available in PATH.
    goto :failed
)

git rev-parse --is-inside-work-tree >nul 2>&1
if errorlevel 1 (
    echo ERROR: This folder is not a Git repository.
    echo Run git init and add a remote first.
    goto :failed
)

if exist ".git\rebase-merge" goto :unfinished
if exist ".git\rebase-apply" goto :unfinished
if exist ".git\MERGE_HEAD" goto :unfinished

set "BRANCH="
for /f "delims=" %%B in ('git branch --show-current') do set "BRANCH=%%B"
if not defined BRANCH (
    echo ERROR: Git is in detached HEAD state.
    echo Switch to a branch before pushing.
    goto :failed
)

git remote get-url origin >nul 2>&1
if errorlevel 1 (
    echo ERROR: No remote named origin exists.
    echo Add one with: git remote add origin REPOSITORY_URL
    goto :failed
)

echo Branch: !BRANCH!
echo.
echo Adding all changes...
git add -A
if errorlevel 1 goto :failed

git diff --cached --quiet
if not errorlevel 1 (
    echo No new changes to commit.
) else (
    set "MSG=Update website %date% %time%"
    echo Creating commit: !MSG!
    git commit -m "!MSG!"
    if errorlevel 1 goto :failed
)

echo.
echo Pushing to origin/!BRANCH!...
git push -u origin "!BRANCH!"
if errorlevel 1 (
    echo.
    echo Push was not completed. The remote may have newer commits.
    echo Run: git pull --rebase origin !BRANCH!
    echo Resolve conflicts if needed, then run this file again.
    goto :failed
)

echo.
echo ========================================
echo SUCCESS: Repository pushed successfully.
echo ========================================
pause
exit /b 0

:unfinished
echo ERROR: A merge or rebase is currently in progress.
echo Run git status and finish or abort it first.
goto :failed

:failed
echo.
echo ========================================
echo FAILED: Read the message above.
echo ========================================
pause
exit /b 1
