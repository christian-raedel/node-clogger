var _ = require('lodash')
    , util = require('util')
    , colors = require('colors')
    , Transport = require('../transport').Transport;

function Console(opts) {
    Transport.apply(this, ['console', opts]);

    this.config.setDefault({
        'colors': {
            'info': 'white',
            'warn': 'yellow',
            'debug': 'orange',
            'error': 'red',
            'trace': 'gray'
        },
        'format': '[{{value:timestamp|datetime|colorize:blue}}] [{{value:id|capitalize}}] - [{{value:level|uppercase|colorize}}] - [{{value:message|capitalize}}]'
    });

    colors.setTheme(this.config.getValue('colors'));

    var self = this;
    this.on('log', function(args) {
        console.log(self.formatString(self.config.getValue('format'), args));
    });
}

util.inherits(Console, Transport);

module.exports = Console;
