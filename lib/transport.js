var _ = require('lodash')
    , EventEmitter = require('events').EventEmitter
    , util = require('util')
    , fs = require('fs')
    , CConf = require('node-cconf').CConf;

function Transport(name, opts) {
    name = name || 'transport';

    EventEmitter.apply(this);

    this.name = name;
    this.config = new CConf(name).load(opts || {});

    var filters = {
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
    } else {
        throw new TypeError('Invalid filter settings for Transport "' + this.id + '"!');
    }

    return value;
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
