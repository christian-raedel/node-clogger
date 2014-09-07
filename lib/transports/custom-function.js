var _ = require('lodash')
    , util = require('util')
    , Transport = require('../transport').Transport;

/**
 * CustomFunction - A logging transport implementation executing a given function.
 * @memberof transports
 * @constructor
 * @param {object} opts (optional) - An object, holding configuration values for the
 * Console transport. The only valid key is a 'function', which is executed on log events.
 * @example
 * var clogger = require('node-clogger');
 * var logger = new clogger.CLogger().addTransport(new clogger.transports.CustomFunction({
 *      'function': function(args) {
 *          console.log('%s|%s|%s|%s', new Date(args.timestamp).toString(), args.id, args.level, args.message);
 *      }
 * });
 * logger.debug('%sl%s', 'd', 'c');
 */
function CustomFunction(opts) {
    opts = opts || {};
    opts.name = opts.name || 'custom-function';

    Transport.apply(this, [opts]);

    this.config
    .removeRequired('format')
    .addRequired('function')
    .addRequired('context')
    .setDefault('context', null);

    this.on('log', function(args) {
        var config = this.config
            , fn = config.getValue('function')
            , context = config.getValue('context');

        if (_.isFunction(fn)) {
            fn.apply(context, [args]);
        } else {
            throw new TypeError('Configured function in Transport:CustomFunction is not a "function"!');
        }
    });
}

util.inherits(CustomFunction, Transport);

module.exports = CustomFunction;
