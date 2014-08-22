module.exports = require('./lib/clogger');

/**
 * transports
 * @namespace
 * @description A collection of plugable logging-transports, required from the 'transports' sub-directory.
 */
module.exports.transports = require('./lib/transport');
