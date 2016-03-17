/*
 * Environments
 * 
 * param: app
 */
module.exports = function(app) {
  var _Environments = {};
  var path = require('../libraries/path');
  var paths = require('../paths/paths');
  config = require(path.join(paths.configurations, '/configurations.js'))(app);
  var common = config.common,
  server_prefix = common.server_prefix || 'PREFIX';
  console.log(server_prefix + " - Environments environment required.");
  _Environments.development = require('./development.js')(app);
  _Environments.production = require('./production.js')(app);
  return _Environments;
};//does not call itself
