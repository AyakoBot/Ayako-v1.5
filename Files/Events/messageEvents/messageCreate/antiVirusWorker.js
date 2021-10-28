const { parentPort } = require('worker_threads');


parentPort.on('message', (data) => {
	start(data);
});

async function start(data) {
