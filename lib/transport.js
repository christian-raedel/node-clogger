var _ = require('lodash')
    , EventEmitter = require('events').EventEmitter
    , util = require('util')
    , sprintf = util.format
    , fs = require('fs')
    , CConf = require('node-cconf')
    , CPlate = require('node-cplate').CPlate;

/**
 * Transport - A logging transport base class used by {@link CLogger.transports}.
 * @abstract
 * @memberof transports
 * @constructor
 * @param {string} name (optional) - An internal identifier.
 * @param {object} opts (optional) - An object, holding options to configure the transport.
 * @description Transport implementations inherit from this class and have to listen to
 * the 'log' event.
 */
function Transport(opts) {
    opts = opts || {};
    opts.name = opts.name || 'transport';

    EventEmitter.apply(this);

    var config = new CConf(opts.name).setDefault('filter', {}).load(opts);

    var filters = {
            /**
             * @method Transport.config.filter
             * @description A set of pre-defined filter functions for working with variables
             * in log-messages. These set contains the functions 'value', 'datetime', 'uppercase',
             * 'colorize' and 'capitalize'. Custom filters can be added in the transport configuration
             * and will be called with the return value of the previous filter in the chain,
             * a parameter and the log-arguments object {'id', 'timestamp', 'message', 'level'}.
             * The special filter 'value' should be the first function in a chain and returns the value
             * of the given parameter in the log-arguments object.
             * Filter calls are written between mustaches ('{{' and '}}'), delimited by a pipe ('|').
             * Filter-parameters are separated by a colon (':').
             * @example
             * var clogger = require('node-clogger');
             * var logFileTransport = new CLogger.transports.LogFile({
             *      'filename': '{{dirname}}/server.log',
             *      'format': '{{value:level|uppercase|colorize}}: {{value:message|capitalize|colorize:green}}',
             *      filter: {
             *          'dirname': function() {
             *              return __dirname;
             *          }
             *      }
             * });
             * var logger = new CLogger('server').addTransport(logFileTransport);
             * logger.info('This message goes to a logfile and the console...');
             */
            difference: function(value) {
                return sprintf('+%sms', value);
            }
        };
    config.setValue('filter', _.merge(filters, config.getValue('filter')));

    var cplate = new CPlate();
    _.forOwn(config.getValue('filter'), function(filter, name) {
        cplate.registerFilter(name, filter);
    });

    this.config = config;
    this.template = cplate;
}

util.inherits(Transport, EventEmitter);

module.exports.Transport      = Transport;
module.exports.Console        = require('./transports/console');
module.exports.CustomFunction = require('./transports/custom-function');
module.exports.LogFile        = require('./transports/log-file');
module.exports.TaffyDb        = require('./transports/taffy-db');

/*
var dir = __dirname + '/transports';
_.forEach(fs.readdirSync(dir), function(filename) {
    if (fs.statSync(dir.concat('/', filename)).isFile() && filename.match(/.*\.js$/)) {
        var name = filename[0].toUpperCase() + filename.slice(1);
        if (_.indexOf(filename, '-')) {
            name = _.map(filename.split('-'), function(part) {
                return part && part[0].toUpperCase() + part.slice(1);
            }).join('');
        }

        module.exports[name.replace('.js', '')] = require(dir.concat('/', filename));
    }
});
*/
