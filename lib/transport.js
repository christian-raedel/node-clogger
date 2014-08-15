var _ = require('lodash')
    , EventEmitter = require('events').EventEmitter
    , util = require('util')
    , fs = require('fs')
    , CConf = require('node-cconf').CConf;

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
function Transport(name, opts) {
    name = name || 'transport';

    EventEmitter.apply(this);

    this.name = name;
    this.config = new CConf(name).setDefault('filters', {}).load(opts || {}).addRequired('format');

    var filters = {
            /**
             * @method Transport.config.filters
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
             * var logFileTransport = new clogger.transports.LogFile({
             *      'filename': '{{dirname}}/server.log',
             *      'format': '{{value:level|uppercase|colorize}}: {{value:message|capitalize|colorize:green}}',
             *      filters: {
             *          'dirname': function() {
             *              return __dirname;
             *          }
             *      }
             * });
             * var logger = new clogger.CLogger('server').addTransport(logFileTransport);
             * logger.info('This message goes to a logfile and the console...');
             */
            value: function(value, param, args) {
                value = args[param];
                if (_.isUndefined(value)) {
                    throw new Error('Value parameter must be a valid log message variable');
                }
                return value;
            },
            datetime: function(value) {
                try {
                    return new Date(value).toLocaleString();
                } catch (err) {
                    throw new TypeError('Datetime parameter must be a valid "Date"!');
                }
            },
            uppercase: function(value) {
                if (_.isString(value)) {
                    return value.toUpperCase();
                } else {
                    throw new TypeError('Uppercase parameter must be from type "String"!');
                }
            },
            colorize: function(value, param, args) {
                if (_.isString(param)) {
                    return value[param];
                } else {
                    var colors = this.config.getValue('colors');
                    if (_.isPlainObject(colors) && value) {
                        return value.toString()[colors[args.level]];
                    } else {
                        throw new TypeError('Colorize parameter must be from type "String"!');
                    }
                }
            },
            capitalize: function(value) {
                if (_.isString(value)) {
                    return value && value[0].toUpperCase() + value.slice(1);
                } else {
                    throw new TypeError('Capitalize parameter must be from type "String"!');
                }
            }
        };
    this.config.setValue('filters', _.merge(this.config.getValue('filters'), filters));
}

util.inherits(Transport, EventEmitter);

/**
 * @method Transport.formatString
 * @private
 * @param {string} str - A format string containing placeholder.
 * @param {object} args - An object with values for replacing with placeholder.
 * @return {string} - A string, ready to write to log-target.
 * @description This method is used internally to format properties like the
 * log-message or the log-filename.
 */
Transport.prototype.formatString = function(str, args) {
    if (_.isString(str) && _.isPlainObject(args)) {
        _.forEach(str.match(/\{\{.*?\}\}/g), function(placeholder) {
            var filters = placeholder.replace(/\{\{|\}\}/g, '').split('|')
                .map(function(value) {
                    return value.trim();
                });
            str = str.replace(placeholder, this.applyFilter(filters, args));
        }, this);

        return str;
    } else {
        throw new Error('Invalid arguments to format log message!')
    }
};

/**
 * @method Transport.applyFilter
 * @private
 * @param {array} filters - An array with filternames to be applied.
 * @param {object} args - An object, holding filter arguments.
 * @return {*} - The filtered value.
 * @description This method is used internally to apply filters to values.
 */
Transport.prototype.applyFilter = function(filters, args) {
    if (_.isArray(filters)) {
        var value = null
            , filterFuncs = this.config.getValue('filters');
        _.forEach(filters, function(filter) {
            var params = filter.split(':').map(function(value) { return value.trim(); });
            var fn = filterFuncs[params.shift()];
            if (_.isFunction(fn)) {
                value = fn.apply(this, [value, params.shift(), args]);
            } else {
                throw new TypeError('Configured filter "' + filter + '" is not from type "function"!');
            }
        }, this);

        return value;
    } else {
        throw new TypeError('Invalid filter settings for Transport "' + this.id + '"!');
    }
};

module.exports.Transport = Transport;

String.prototype.capitalize = function() {
    var str = _.toArray(this).join('');
    return str && str[0].toUpperCase() + str.slice(1);
};

var dir = __dirname + '/transports';
_.forEach(fs.readdirSync(dir), function(filename) {
    if (fs.statSync(dir.concat('/', filename)).isFile() && filename.match(/.*\.js$/)) {
        var name = filename.capitalize();
        if (_.indexOf(filename, '-')) {
            name = _.map(filename.split('-'), function(part) {
                return part.capitalize();
            }).join('');
        }

        module.exports[name.replace('.js', '')] = require(dir.concat('/', filename));
    }
});
