/**
 * Created by mtford on 31/01/2014.
 */

var Connection = require('ssh2');
var Fs = require('fs');
var Util = require('./utils');
var Logger = require('./../config').logger;
var poolModule = require('generic-pool');

/**
 * SSH API, provides pool
 * @param options
 * @constructor
 */
exports.SSHConnection = function(options) {

    var self = this;

    // The below specifies available options + defaults
    var defaultOptions = {
        host: '',
        port: 22,
        username: '',
        privateKey: null
    };

    __init();

    function __init () {
        Logger.debug('Initalising SSH Connection with options: ', options);
        self.options = Util.mergeOptions(defaultOptions, options);
        self.pool = poolModule.Pool({
            name     : 'ssh',
            create   : function(callback) {
                var client = new Connection();
                client.on('ready', function() {
                    log('info', 'Connection ready');
                    callback(null,client);
                });
                client.on('error', function(e) {
                    log('warn', 'Error in ssh connection');
                    callback(e,null);
                });
                client.on('end', function() {
                    log('info', 'Connection ended');
                });
                client.on('close', function(had_error) {
                    log('info', 'Connection closed');
                    if (had_error) {
                        self.pool.destroy(client);
                    }
                });
                client.connect({
                    host: '46.51.201.85',
                    port: 22,
                    username: 'ubuntu',
                    privateKey: require('fs').readFileSync('/Users/mtford/Dropbox/Drake/Server-Side/dev.pem')
                });

            },
            destroy  : function (c) {c.end()},
            max      : 10,
//            min      : 2,
            idleTimeoutMillis : 3000,
            log : true
        });

    }

    this.uptime = function (callback) {
        self.pool.acquire(function(err, client) {
            if (err) {
                // handle error - this is generally the err from your
                // factory.create function
            }
            else {
                client.exec('uptime', function(err, stream) {
                    if (err) callback(err, null);
                    stream.on('data', function(data, extended) {
                        log('info',((extended === 'stderr' ? 'STDERR: ' : 'STDOUT: ')
                            + data));
                        callback(null, null);
                        self.pool.release(client);
                    });
                    stream.on('end', function () {
                        console.log('Stream :: EOF');
                    });
                    stream.on('close', function () {
                        console.log('Stream :: close');
                    });
                    stream.on('exit', function (code, signal) {
                        log('info',('Stream :: exit :: code: ' + code + ', signal: ' + signal));
                    })
                });
            }
        });

    };

    this.close = function (callback) {
        Logger.debug('Closing all');
        self.pool.drain(function() {
            Logger.debug('In drain state');
            self.pool.destroyAllNow(function () {
                Logger.debug('All destroyed');
                callback();
            });
        });

    };

    function log(level, message) {
        message = 'SSHConnection[' + self.options.host + ":" + self.options.port.toString() + "] " + message;
        Logger.log(level, message);
    }

};