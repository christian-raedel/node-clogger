var _ = require('lodash')
    , util = require('util')
    , Transport = require('../transport').Transport;

function CustomFunction(opts) {
    Transport.apply(this, ['custom-function', opts]);

    this.config.addRequired('function')
    .addRequired('context')
    .setDefault('context', this);

    this.on('log', function(args) {
        var fn = this.config.getValue('function');

        if (_.isFunction(fn)) {
            fn.apply(context, [args]);
        } else {
            throw new TypeError('Configured function in Transport:CustomFunction is not a "function"!');
        }
    });
}

util.inherits(CustomFunction, Transport);

module.exports = CustomFunction;
