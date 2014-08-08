var _ = require('lodash')
    , util = require('util')
    , fs = require('fs')
    , Transport = require('../transport').Transport;

function LogFile(opts) {
    Transport.apply(this, ['log-file', opts]);

    this.config.addRequired('filename')
        .addRequired('format')
        .setDefault('format', '[{{value:timestamp|datetime}}] [{{value:id|capitalize}}] - [{{value:level|uppercase}}] - {{value:message|capitalize}}\n');

    var self = this;
    this.on('log', function(args) {
        var filename = self.formatString(self.config.getValue('filename'), args);

        var stream = fs.createWriteStream(filename, {encoding: 'utf8', flags: 'a', mode: 0600})
        .on('error', function(err) {
            throw new Error('Configured logfile "' + filename + '" for Transport:LogFile is not writeable!');
        });

        var str = self.formatString(self.config.getValue('format'), args);
        stream.write(str);
        stream.end();
    });
}

util.inherits(LogFile, Transport);

module.exports = LogFile;
