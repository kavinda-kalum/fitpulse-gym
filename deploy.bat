@echo off
REM FitPulse - push this folder to a NEW GitHub repo
REM 1) First create an EMPTY public repo on github.com/new named: fitpulse-gym
REM 2) Then double-click this file (or run it in cmd from this folder)

cd /d "%~dp0"
set REPO=https://github.com/kavinda-kalum/fitpulse-gym.git

if exist .git (
  echo This folder is already a git repo - pushing updates...
  git add .
  git commit -m "Update FitPulse"
  git push
  pause
  exit /b
)

git init -b main
git add .
git commit -m "FitPulse gym tracker"
git remote add origin %REPO%
git push -u origin main
echo.
echo Done! Now open https://github.com/kavinda-kalum/fitpulse-gym/settings/pages
echo and set Source: Deploy from a branch, Branch: main, / (root), then Save.
pause
