var _ = require('lodash')
    , util = require('util')
    , CConf = require('node-cconf')
    , transports = require('./transport');

/**
 * CLogger - A node.js logger.
 * @constructor
 * @param {string} id (optional) - An internal identifier.
 * @param {object} opts (optional) - An object, holding options to configure the logger instance.
 * At the moment, the only configurable options, are an array of transports to be used and an
 * array of visible log-levels. Log-levels can be given as environment-variables in the form of
 * 'VISIBLE=info,warn,error node app.js'.
 * @example
 * var CLogger = require('node-clogger');
 * var logger = new CLogger('server', {
 *      transports: [
 *          new CLogger.transports.Console()
 *      ],
 *      visible: ['info', 'error']
 * });
 * logger.info('Outputs something to the node console...');
 */
function CLogger(opts) {
    this.config = new CConf('clogger', [
        'name',
        'transports',
        'visible'
    ], {
        name: 'default',
        transports: [
            new transports.Console()
        ],
        visible: [
            'info',
            'warn',
            'debug',
            'error'
        ]
    }).load(opts || {}).parseEnv();
}

/**
 * @method CLogger.addTransport
 * @param {object} transport - An instance of {@link Transport}.
 * @return {object} this
 * @description Add an instance of {@link Transport} to the list of used transports.
 * This can be useful, if one will combine the default console transport with logging
 * to a log-file.
 */
CLogger.prototype.addTransport = function(transport) {
    if (transport instanceof transports.Transport) {
        this.config.getValue('transports').push(transport);
    } else {
        throw new TypeError('Valid transports are instances of Transport!');
    }

    return this;
};

/**
 * @method CLogger.log
 * @param {string} level - A log-level, represented by a string. Valid default log-levels are
 * 'info', 'warn', 'debug', 'error' and 'trace'.
 * @param {string} message - A message to log.
 * @param {*} args (optional) - If the message argument contains placeholder like '%s' for
 * a string, the args can be appended to this function and will be replaced by the placeholder.
 * See node's util.format for valid placeholder and format options.
 * @return {object} this
 * @description This function is called internally by the different log-functions like {@link CLogger.info}.
 * It can be used to log to custom log-levels.
 */
CLogger.prototype.log = function(level, message) {
    var args = _.toArray(arguments).slice(2)
        , config = this.config
        , visible = config.getValue('visible');

    if ((_.isString(visible) && visible === level) || (_.isArray(visible) && _.indexOf(visible, level) > -1)) {
        var timestamp = new Date().getTime()
            , diff = timestamp - (this.timestamp || timestamp);

        message = util.format.apply(null, [message].concat(args));

        var transports = config.getValue('transports');
        var name = config.getValue('name');
        _.forEach(transports, function(transport) {
            var args = {
                timestamp: timestamp,
                id: name,
                level: level,
                message: message,
                diff: diff
            };
            transport.emit('log', args);
        }, this);

        this.timestamp = timestamp;
    }

    return this;
};

/**
 * @method CLogger.info
 * @method CLogger.warn
 * @method CLogger.debug
 * @method CLogger.error
 * @method CLogger.trace
 * @param {string} message - A message to log.
 * @param {*} args (optional) - See {@link CLogger.log}.
 * @return {object} this
 * @description This method delegates the message and its arguments to the
 * {@link CLogger.log} method.
 */
var level = ['info', 'warn', 'debug', 'error', 'trace'];
_.forEach(level, function(level) {

    CLogger.prototype[level] = function(message) {
        var args = _.toArray(arguments).slice(1);
        CLogger.prototype.log.apply(this, [level, message].concat(args));
        return this;
    };

});

/**
 * @method CLogger.extend
 * @param {object} obj - An object to extend with logging functions.
 * @return {function} - A function to undo logging extensions.
 * @description A method to extend an ordinary object with logging capabilities.
 * It creates a method for each log-level and stores the logger itself in 'obj._logger'.
 * @example
 * var clogger = require('node-clogger');
 * new CLogger().addTransport(new CLogger.transports.LogFile({
 *      'filename': __dirname + '/server.log'
 * })).extend(console);
 * console.info('This message will be printed on console and in a logfile...');
 */
CLogger.prototype.extend = function(obj) {
    if (typeof obj === 'object') {
        obj['_logger'] = this;
        _.forEach(level, function(level) {
            var self = this;
            obj[level] = function(message) {
                var args = _.toArray(arguments).slice(1);
                CLogger.prototype.log.apply(self, [level, message].concat(args));

                return obj;
            };
        }, this);

        return function unextend(cb) {
            _.forEach(level, function(level) {
                if (obj.hasOwnProperty(level)) {
                    delete obj[level];
                }
            }, this);
            if (obj.hasOwnProperty('_logger')) {
                delete obj['_logger'];
            }

            if (_.isFunction(cb)) {
                return cb.apply(obj);
            } else {
                return obj;
            }
        };
    } else {
        throw new TypeError('CLogger extends only "objects"!');
    }
};

module.exports = CLogger;
