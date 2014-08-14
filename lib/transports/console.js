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
