var _ = require('lodash')
    , expect = require('chai').expect
    , taffydb = require('taffydb').taffy
    , fs = require('fs')
    , clogger = require('../lib');

describe('CLogger', function() {
    it('should instanciates', function() {
        expect(new clogger.CLogger()).to.be.an.instanceof(clogger.CLogger);
    });

    it('should extends an existing object with log-functions', function(done) {
        var called = null
            , obj = {}
            , logger = new clogger.CLogger().addTransport(new clogger.transports.CustomFunction({
                'function': function(args) {
                    expect(args.timestamp).to.be.above(0);
                    expect(args.id).to.be.equal('default');
                    expect(args.level).to.be.equal('info');
                    expect(args.message).to.be.equal('dlc');
                    expect(obj._logger).to.be.an.instanceof(clogger.CLogger);
                    called = true;
                }
            }));

        var unextend = logger.extend(obj);
        obj.info('%sl%s', 'd', 'c');
        unextend(setTimeout(function() {
            expect(this._logger).to.be.not.ok;
            expect(called).to.be.true;
            done();
        }, 500));
    });
});

describe('CLogger:Transport:Console', function() {
    it('should logs to a console', function() {
        var logger = new clogger.CLogger('test', {
            transports: [
                new clogger.transports.Console({
                    'colors': {
                        'info': 'yellow'
                    },
                    'format': '\t[{{value:timestamp|datetime}}] [{{value:id}}] - [{{value:level|uppercase|colorize}}] : {{value:message|redish}}',
                    filters: {
                        datetime: function(value) {
                            expect(value).to.be.above(0);
                            return new Date(value).toLocaleString();
                        },
                        uppercase: function(value) {
                            expect(value).to.be.equal('info');
                            return value.toUpperCase();
                        },
                        colorize: function(value) {
                            var colors = this.config.getValue('colors');
                            expect(colors.info).to.be.equal('yellow');
                            return value.toString()[colors.info];
                        },
                        redish: function(value) {
                            return value.red;
                        }
                    }
                })
            ]
        });

        logger.info('%sl%s', 'd', 'c');
    });

    it('should logs with different log levels', function() {
        var logger = new clogger.CLogger();

        _.forEach(['info', 'warn', 'debug', 'error', 'trace'], function(level) {
            logger[level]('dlc');
        }, this);
    });
});

describe('CLogger:Transport:CustomFunction', function() {
    it('should logs to a custom function', function(done) {
        var logger = new clogger.CLogger('test', {
            transports: [
                new clogger.transports.CustomFunction({
                    'function': function customLog(args) {
                        expect(args.timestamp).to.be.ok;
                        expect(args.level).to.be.equal('info');
                        expect(args.id).to.be.equal('test');
                        expect(args.message).to.be.equal('dlc');
                        done();
                    }
                })
            ]
        });

        logger.log('info', '%sl%s', 'd', 'c');
    });
});

describe('CLogger:Transport:TaffyDb', function() {
    it('should logs to a TaffyDb instance', function() {
        var targetdb = taffydb()
            , logger = new clogger.CLogger('test', {
                transports: [
                    new clogger.transports.TaffyDb({
                        targetdb: targetdb
                    })
                ]
            });

        logger.log('info', '%sl%s', 'c', 'd');

        var logdata = targetdb().first();
        expect(logdata.___id).to.be.ok;
        expect(logdata.level).to.be.equal('info');
        expect(logdata.id).to.be.equal('test');
        expect(logdata.message).to.be.equal('cld');
    });
});

describe('CLogger:Transport:LogFile', function() {
    it('should logs to a logfile', function(done) {
        var logger = new clogger.CLogger('test', {
                transports: [
                    new clogger.transports.LogFile({
                        'filename': '{{dirname}}/test.log',
                        filters: {
                            dirname: function() {
                                return __dirname;
                            }
                        }
                    })
                ]
            });

        logger.log('info', '%sl%s', 'd', 'c');

        setTimeout(function() {
            try {
                var filename = __dirname + '/test.log';
                var logdata = fs.readFileSync(filename, {encoding: 'utf8', mode: 'r'});
                expect(logdata).to.match(/\[Test\]/);
                expect(logdata).to.match(/INFO\:/);
                expect(logdata).to.match(/Dlc/);
                done();
            } finally {
                fs.unlinkSync(filename);
            }
        }, 1000);
    });
});
