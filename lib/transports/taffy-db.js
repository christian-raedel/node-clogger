var util = require('util')
    , taffydb = require('taffydb').taffy
    , Transport = require('../transport').Transport;

/**
 * TaffyDb - A logging transport implementation using a [TaffyDb]{@link http://www.taffydb.com} instance.
 * @memberof transports
 * @constructor
 * @param {object} opts (optional) - An object, holding configuration values for the
 * TaffyDb transport. The only valid key is the 'targetdb', an instance of TaffyDb.
 * @example
 * var clogger = require('node-clogger');
 * var taffydb = require('taffydb').taffy;
 * var targetdb = taffydb();
 * var logger = new clogger.CLogger().addTransport(new clogger.transports.TaffyDb({
 *      'targetdb': targetdb
 * });
 * logger.debug('%sl%s', 'd', 'c');
 */
function TaffyDb(opts) {
    opts = opts || {};
    opts.name = opts.name || 'taffy-db';

    Transport.apply(this, [opts]);

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
