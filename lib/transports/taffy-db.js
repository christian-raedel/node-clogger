var util = require('util')
    , taffydb = require('taffydb').taffy
    , Transport = require('../transport').Transport;

function TaffyDb(opts) {
    Transport.apply(this, ['taffy-db', opts]);

    this.config.addRequired('targetdb');

    var self = this;
    this.on('log', function(args) {
        var targetdb = self.config.getValue('targetdb');

        if (targetdb && targetdb.TAFFY) {
            targetdb.insert(args);
        } else {
            throw new TypeError('Configured logdb in Transport:TaffyDb is not an instance of "TaffyDb"');
        }
    });
}

util.inherits(TaffyDb, Transport);

module.exports = TaffyDb;
