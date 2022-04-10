while [ true ]
do
node --trace-deprecation --trace-warnings --max-old-space-size=8192 ./Ayako-v1.5.js
sleep 0s
done
exit