var _ = require('lodash')
    , util = require('util')
    , fs = require('fs')
    , Transport = require('../transport').Transport;

/**
 * LogFile - A logging transport implementation using node's StreamWriter
 * to write messages to a logfile.
 * @memberof transports
 * @constructor
 * @param {object} opts (optional) - An object, holding configuration values for the
 * LogFile transport. Valid keys are the 'filename' and the log-message 'format'.
 * @example
 * var clogger = require('node-clogger');
 * var logger = new clogger.CLogger().addTransport(new clogger.transports.LogFile({
        'filename': '{{dirname}}/server.log',
 *      'format': '[{{value:timestamp|datetime}}] - [{{value:id}}] - [{{value:level}}] - {{value:message|capitalize}}',
 *      filters: {
 *          'dirname': function() {
 *              return __dirname;
 *          }
 *      }
 * });
 * logger.debug('%sl%s', 'd', 'c');
 */
function LogFile(opts) {
    opts = opts || {};
    opts.name = opts.name || 'log-file';

    Transport.apply(this, [opts]);

    this.config
    .addRequired('filename')
    .addRequired('format')
    .setDefault('format', '[{{timestamp|datetime}}] [{{id|camelcase}}] {{diff|rightalign:4|difference}} - {{level|uppercase}}:\t{{message|capitalize}}\n');

    var self = this;
    this.on('log', function(args) {
        var filename = self.template.format(self.config.getValue('filename'), args);

        var stream = fs.createWriteStream(filename, {encoding: 'utf8', flags: 'a', mode: 0600})
        .on('error', function(err) {
            throw new Error('Configured logfile "' + filename + '" for Transport:LogFile is not writeable!');
        });

        var str = self.template.format(self.config.getValue('format'), args);
        stream.write(str);
        stream.end();
    });
}

util.inherits(LogFile, Transport);

module.exports = LogFile;
