var _ = require('lodash')
    , util = require('util')
    , Transport = require('../transport').Transport;

/**
 * Console - A logging transport implementation using node's 'console.log()'.
 * @memberof transports
 * @constructor
 * @param {object} opts (optional) - An object, holding configuration values for the
 * Console transport. Valid keys are the ['colors']{@link https://www.npmjs.org/package/colors}
 * for each log-level and the 'format'.
 * @example
 * var clogger = require('node-clogger');
 * var logger = new clogger.CLogger().addTransport(new clogger.transports.Console({
 *      'theme': {
 *          'info': 'grey',
 *          'warn': 'yellow',
 *          'debug': 'rainbow',
 *          'error': 'magenta',
 *          'trace': 'zebra'
 *      },
 *      'format': '[{{value:timestamp|hours}}] - [{{value:id|colorize:bold}}] - [{{value:level|colorize}}] - {{value:message|capitalize}}',
 *      filters: {
 *          'hours': function(value) {
 *              return new Date(value).getHours();
 *          }
 *      }
 * });
 * logger.debug('%sl%s', 'd', 'c');
 */
function Console(opts) {
    opts = opts || {};
    opts.name = opts.name || 'console';

    Transport.apply(this, [opts]);

    this.config
    .addRequired('format')
    .setDefault({
        'theme': {
            'info': 'blue',
            'warn': 'yellow',
            'debug': 'green',
            'error': 'red',
            'trace': 'grey'
        },
        'format': '[{{timestamp|datetime|colorize:grey}}] [{{id|camelcase}}] {{diff|rightalign:4|difference|colorize:cyan}} - {{level|uppercase|colorize}}:\t{{message|capitalize|colorize:grey}}'
    });

    var self = this;
    self.on('log', function(args) {
        var format = self.config.getValue('format')
            , theme = self.config.getValue('theme');
        args.theme = theme;
        console.log(self.template.format(format, args));
    });
}

util.inherits(Console, Transport);

module.exports = Console;
