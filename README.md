[![Build Status](https://travis-ci.org/christian-raedel/node-clogger.svg?branch=master)](https://travis-ci.org/christian-raedel/node-clogger)

# CLogger #

A [node.js](http://nodejs.org) logging module with various configurable and
extendable transports. As per default, the **CLogger** prints its
colored messages to the node-console, but it can be configured to
logs to a [TaffyDB](http://www.taffydb.com) instance, a log-file
or a custom function.

The format of the log-messages is also highly configurable, with
various chainable pre-defined or custom filter-functions.

## Installation ##

```
npm install --save git+https://github.com/christian-raedel/node-clogger.git#v0.3.3
```

### Testing ###

```
cd /path/to/node-clogger
make install test
```

### Documentation ###

```
cd /path/to/node-clogger
make install docs
$BROWSER doc/index.html
```
or [browse
online](http://christian-raedel.github.io/node-clogger/index.html)

## Basic Usage ##

``` Javascript
var CLogger = require('node-clogger');

// Create a new CLogger instance with reasonable defaults.
var logger = new CLogger();
logger.log('info', 'log #1');
logger.debug('log #%d', 2);
logger.error('some error message: %s', 'fail...');

// Create a new CLogger instance which logs to the console
// and a log-file. The log-file name is returned by a custom
// filter-functions, just as the logger-id in the console output
// (which prints 'server' in reverse).
var logger = new CLogger('server', {
    transports: [
        new CLogger.transports.LogFile({
            'filename': '{{filename}}.log',
            filters: {
                filename: function() {
                    return new Date().toDateString;
                }
            }
        }),
        new CLogger.transports.Console({
            'colors': {
                'info': 'grey',
                'warn': 'yellow',
                'debug': 'green',
                'error': 'red',
                'trace': 'grey'
            },
            'format': '{{value:timestamp|datetime}} [{{value:id|fun}}] [{{value:level|uppercase|colorize}}] - {{value:message|colorize:rainbow}}',
            filters: {
                fun: function(value) {
                    return value.split('').reverse().join('');
                }
            }
        })
    ]
});
logger.info('A message under the rainbow...');
```
