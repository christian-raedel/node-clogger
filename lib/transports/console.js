var _ = require('lodash')
    , util = require('util')
    , colors = require('colors')
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
 *      'colors': {
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
    Transport.apply(this, ['console', opts]);

    this.config.setDefault({
        'colors': {
            'info': 'white',
            'warn': 'yellow',
            'debug': 'green',
            'error': 'red',
            'trace': 'grey'
        },
        'format': '[{{value:timestamp|datetime|colorize:blue}}] [{{value:id|capitalize}}] - {{value:level|uppercase|colorize}}:\t{{value:message|capitalize}}'
    });

    colors.setTheme(this.config.getValue('colors'));

    var self = this;
    this.on('log', function(args) {
        console.log(self.formatString(self.config.getValue('format'), args));
    });
}

util.inherits(Console, Transport);

module.exports = Console;
