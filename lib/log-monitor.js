/**
 * Created by mtford on 01/02/2014.
 */


var EventEmitter = require('events').EventEmitter;
var util = require('util');
util.inherits(LogStream, EventEmitter);

function LogStream(sshPool, path, opts) {
    if (!(this instanceof LogStream))
        return new LogStream(sshPool, path, opts);

    var self = this;
    EventEmitter.call(this);

    this.sshPool = sshPool;
    this.path = path;
    this.client = null;

    this.start = function (callback) {
        sshPool.pool.acquire(function (err, client) {
            if (err) {
                callback(err);
            }
            else {
                client.exec('tail -f ' + self.path, function(err, stream) {
                    if (err) {
                        callback(err);
                    }
                    else {
                        self.sshStream = stream;
                        self.emit('started');
                        stream.on('data', function(data, extended) {
                            var isStdErr = extended === 'stderr';
                            if (isStdErr) handleError(data);
                            else processLogData(data);
                        });
                        stream.on('end', function() {
                            terminate();
                        });
                        stream.on('error', function() {
                            terminate();
                        });
                        stream.on('close', function () {
                            terminate();
                        });
                    }
                });
            }
        });
    };

    function processLogData(data) {
        var str = data.toString();
        if (str.indexOf('FATAL') != -1) {
            self.emit('log-fatal', str);
        }
        else if (str.indexOf('ERROR') != -1) {
            self.emit('log-error', str);
        }
        else if (str.indexOf('WARNING') != -1) {
            self.emit('log-warn', str);
        }
    }

    function handleError(data) {
        terminate();
        self.emit('error', data);
    }

    function terminate() {
        if (self.client && self.sshPool) {
            sshPool.release(self.client);
            self.emit('end');
        }
        self.client = null;
    }

}

function LogMonitor(sshPool, path) {

    var self = this;

    this.logStream = new LogStream(sshPool, path);

    this.data = null;
    this.clear();

    this.start = function() {
        this.logStream.start();
        this.logStream.on('started', function() {

        });
        this.logStream.on('error', function() {

        });
        this.logStream.on('end', function() {

        });
        this.logStream.on('log-warn', function() {

        });
        this.logStream.on('log-error', function() {

        });
        this.logStream.on('log-fatal', function() {

        });
    };

    this.stop = function () {
        this.logStream.stop();
        self.clear();
    };

    this.clear = function () {
        self.data= {
            warn: [],
            error: [],
            fatal: []
        };
    }
}

exports.LogMonitor = LogMonitor;
