const { Pool } = require('pg');
const auth = require('./auth.json');
const ch = require('./ClientHelper.js');

const pool = new Pool({
	user: 'postgres',
	host: 'localhost',
	database: 'Ayako_DB',
	password: auth.pSQLpw,
	port: 5432,
});
pool.query('SELECT NOW() as now;', (err) => {
	if (err) {
		ch.logger('| Couldn\'t connect to DataBase', err.stack);
	} else {
		console.log('| Established Connection to DataBase');
	}
});
pool.connect((err) => {
	if (err) {
		ch.logger('Error while logging into DataBase', err.stack);
	}
});
pool.on('error', (err) => {
	ch.logger('Unexpected error on idle pool client', err);
});

module.exports = { pool };