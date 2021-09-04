const fs = require('fs');
const path = require('path');

module.exports = {
	execute() {
		const directory = './Files/Downloads/Captchas/';
		fs.readdir(directory, (err, files) => {
			if (err) throw err;
			for (const file of files) {
				fs.unlink(path.join(directory, file), err => {
					if (err) throw err;
				});
			}
		});
	}
};