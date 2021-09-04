@echo off
title Ayako Dev Version
:start
    node --trace-deprecation --trace-warnings --max-old-space-size=8192 "index.js"
    timeout /t 0 /nobreak
goto start
exit