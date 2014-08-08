var _ = require('lodash')
    , util = require('util')
    , CConf = require('node-cconf').CConf
    , transports = require('./transport');

function CLogger(id, opts) {
    if (arguments.length === 1 && _.isPlainObject(id)) {
        config = id;
        id = 'default'
    }

    this.id = id || 'default';
    this.config = new CConf('clogger', [
        'transports'
    ], {
        transports: [
            new transports.Console()
        ]
    }).load(opts || {});
}

CLogger.prototype.addTransport = function(transport) {
    if (transport instanceof transports.Transport) {
        this.config.getValue('transports').push(transport);
    } else {
        throw new TypeError('Valid transports are instances of Transport!');
    }

    return this;
};

CLogger.prototype.log = function(level, message) {
    var args = _.toArray(arguments).slice(2)
        , timestamp = new Date().getTime();

    message = util.format.apply(null, [message].concat(args));

    _.forEach(this.config.getValue('transports'), function(transport) {
        transport.emit('log', {
            timestamp: timestamp,
            id: this.id,
            level: level,
            message: message
        });
    }, this);

    return this;
};

var level = ['info', 'warn', 'debug', 'error', 'trace'];
_.forEach(level, function(level) {

    CLogger.prototype[level] = function(message) {
        var args = _.toArray(arguments).slice(1);
        this.log.apply(this, [level, message].concat(args));
        return this;
    };

});

module.exports = CLogger;
