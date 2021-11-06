['https://bit.ly/3we2sYy', 'https://dis.gd'];


module.exports = {
	name: 'execute',
	aliases: ['e'],
	perm: 268435456n,
	dm: true,
	takesFirstArg: false,
	// eslint-disable-next-line no-unused-vars
	async execute(msg) {

		const request = require('request');
		const res = await new Promise((resolve) => {
			request({ method: 'HEAD', url: 'https://bit.ly/3we2sYy', followAllRedirects: true },
				function (error, response) {
					resolve(response.request.href);
				});
		});

		console.log(res);

	}
};