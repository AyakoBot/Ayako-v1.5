@echo off
title Ayako Test Version
:start
    node --max-old-space-size=4096 "index.js"
    timeout /t 0 /nobreak
goto start
exit