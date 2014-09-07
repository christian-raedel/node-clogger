var CLogger    = require('../index')
    , memwatch = require('memwatch')
    , inspect  = require('eyes').inspector();

var logger = new CLogger({
    name: 'profile',
    transports: [
        //new CLogger.transports.CustomFunction({
        //    'function': function (opts) {
        //        console.log(inspect(opts));
        //    }
        //}),
        new CLogger.transports.Console()
    ]
});

memwatch.on('leak', function (info) {
    console.log('memory leak:\t', inspect(info));
});

memwatch.on('stats', function (stats) {
    console.log('memory stats:\t', inspect(stats));
});

var count = 0;
function test () {
    var heapDiff = new memwatch.HeapDiff();
    for (var i = 0; i < 102; i++) {
        logger.info('sample output');
    }
    var diff = heapDiff.end();
    console.log('memory heap diff:\t', inspect(diff));
    count++;
    if (count === 27) {
        clearInterval(id);
        process.exit(0);
    }
}

test();
var id = setInterval(test, 15000);
