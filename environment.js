/*
 * Environment
 * 
 * param: app
 */
module.exports = function(app) {
	var _Environment = {};
	config = require('../configs/server.js');
	var configs = config.configs,
		server_prefix = configs.server_prefix || 'PREFIX';
	console.log(server_prefix + " - Environments environment required.");
	_Environment.development = require('./development.js')(app);
	_Environment.production = require('./production.js')(app);
	return _Environment;
};
