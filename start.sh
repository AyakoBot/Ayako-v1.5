function start {
    pm2 start --node-args="--trace-deprecation --trace-warnings --max-old-space-size=8192" ./Ayako-v1.5.js
    sleep 0s
}
start
exit