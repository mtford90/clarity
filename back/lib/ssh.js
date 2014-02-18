/**
 * Created by mtford on 31/01/2014.
 */

var Connection = require('ssh2');
var Fs = require('fs');
var Util = require('./utils');
var Logger = require('./../config').logger;
var poolModule = require('generic-pool');
var _ = require('underscore');
var util = require("util");

// TODO: Seperate out operations on SSH into prototype methods on ssh client objects instead, leaving just the pool stuff in here.


/**
 * Extends Connection with standard operations over ssh.
 * @param opts
 * @constructor
 */
var VisionConnection = function () {
    Connection.call(this);
    this.memInfoKey = {
        MemTotal: 'MemTotal',
        MemFree: 'MemFree',
        Buffers: 'Buffers',
        Cached: 'Cached',
        SwapCached: 'SwapCached',
        Active: 'Active',
        Inactive: 'Inactive',
        Unevictable: 'Unevictable',
        Mlocked: 'Mlocked',
        SwapTotal: 'SwapTotal',
        SwapFree: 'SwapFree',
        Dirty: 'Dirty',
        Writeback: 'Writeback',
        AnonPages: 'AnonPages',
        Mapped: 'Mapped',
        Shmem: 'Shmem',
        Slab: 'Slab',
        SReclaimable: 'SReclaimable',
        SUnreclaim: 'SUnreclaim',
        KernelStack: 'KernelStack',
        PageTables: 'PageTables',
        NFS_Unstable: 'NFS_Unstable',
        Bounce: 'Bounce',
        WritebackTmp: 'WritebackTmp',
        CommitLimit: 'CommitLimit',
        Committed_AS: 'Committed_AS',
        VmallocTotal: 'VmallocTotal',
        VmallocUsed: 'VmallocUsed',
        VmallocChunk: 'VmallocChunk',
        HardwareCorrupted: 'HardwareCorrupted',
        AnonHugePages: 'AnonHugePages',
        HugePages_Total: 'HugePages_Total',
        HugePages_Free: 'HugePages_Free',
        HugePages_Rsvd: 'HugePages_Rsvd',
        HugePages_Surp: 'HugePages_Surp',
        Hugepagesize: 'Hugepagesize',
        DirectMap4k: 'DirectMap4k',
        DirectMap2M: 'DirectMap2M'
    };
};

util.inherits(VisionConnection, Connection);

/**
 * Get percentage swap used as a float
 * @param callback
 */
VisionConnection.prototype.swapUsedPercentage = function(callback) {
    var self = this;
    this.memoryInfo(function (err, info) {
        if (err) callback(err, null);
        callback(null,info[self.memInfoKey.SwapFree]  / info[self.memInfoKey.SwapTotal]);
    })
};

/**
 * Takes average load over 1 minute, 5 minutes and 15 minutes from uptime command
 * @param callback
 */
VisionConnection.prototype.averageLoad = function (callback) {
    this.execute('uptime', function(err, data) {
        if (err) callback(err, data);
        var averages = data.split('load average:');
        Logger.debug(averages);
        averages = averages[averages.length-1].trim().split(' ');
        averages = {
            1: parseFloat(averages[0]),
            5: parseFloat(averages[1]),
            15: parseFloat(averages[2])
        };
        callback(null, averages);
    })
};

/**
 * Prints /proc/meminfo to stdout and parses it into a dictionary.
 * @param callback
 */
VisionConnection.prototype.memoryInfo = function (callback) {
    this.execute('cat /proc/meminfo', function (err, data) {
        if (err) callback (err, null);
        var kv = _.map(data.split('\n'), function (x) {return x.split(':')});
        kv.pop(); // Remove spurious last val.
        kv = _.map(kv, function(x) {
            var key = x[0];
            var val = x[1];
            if (val) {
                val = val.trim();
                if (val.indexOf('kB') != -1)  val = val.substring(0, val.length-3);
                val = parseInt(val);
            }
            return [key, val];
        });
        var info = _.reduce(kv, function(memo, x) {memo[x[0]] = x[1]; return memo},{});
        callback(null, info);
    });
};

VisionConnection.prototype.execute = function(exec_str, callback) {
    var self = this;
    self.exec(exec_str, function (err, stream) {
        stream.on('data', function (data, extended) {
            if (extended === 'stderr') {
                callback (data.toString(), null);
            }
            else {
                callback (null, data.toString());
            }
        });
    });
};

/**
 * Return the percentage disk space used on mount being used at path
 * @param path
 * @param callback
 */
function percentageUsed(path, callback) {
    this.execute('df ' + path + ' -h | tail -n 1', function (err, data) {
        if (err && callback) callback(err, null);
        var percentageString = data.match(/\S+/g)[4];
        var percentageUsed = parseFloat(percentageString.substring(0, percentageString.length - 1)) / 100;
        if (callback) callback(null, percentageUsed);
    });
}

VisionConnection.prototype.percentageUsed = function(path, callback) {
    percentageUsed.call(this, path, callback);
};

VisionConnection.prototype.percentageFree = function(path, callback) {
    percentageUsed.call(this, path, function(error, percentageUsed) {
        callback(error, percentageUsed ? 1 - percentageUsed : null);
    });
};

/**
 * Provides access to pool of ssh connections with basic system inspection methods
 * @param options
 * @constructor
 */
var SSHConnectionPool = function(options) {

    var self = this;

    // The below specifies available options  
    var defaultOptions = {
        host: '',
        port: null,
        username: '',
        privateKey: null
    };

    init();

    this.acquire = this.pool.acquire;
    this.release = this.pool.release;
    this.oneShot = function(callback) {
        self.acquire(function(err, client) {
            if (err || client) {
                callback(err, client);
            }
            else {
                callback('Unable to obtain an SSH client connection', null);
            }
            self.release(client);
        });
    };

    /**
     * Terminates all ssh connections in the pool.
     * @param callback
     */
    this.drain = function (callback) {
        Logger.debug('Closing all');
        self.pool.drain(function() {
            Logger.debug('In drain state');
            self.pool.destroyAllNow(function () {
                Logger.debug('All destroyed');
                if (callback) callback();
            });
        });
    };

    /**
     * Initialise connection pool
     */
    function init () {
        self.options = Util.mergeOptions(defaultOptions, options);
        self.pool = poolModule.Pool({
            name     : 'ssh',
            create   : function(callback) {
                var client = new VisionConnection();
                client.on('ready', function() {
                    log('info', 'Connection ready');
                    callback(null,client);
                });
                client.on('error', function(e) {
                    log('error', 'Error in ssh connection: ' + e);
                    callback(e,null);
                });
                client.on('end', function() {
                    log('info', 'Connection ended');
                });
                client.on('close', function() {
                    log('info', 'Connection closed');
                });
                client.connect({
                    host: self.options.host,
                    port: self.options.port,
                    username: self.options.username,
                    privateKey: self.options.privateKey
                });

            },
            destroy  : function (c) {c.end()},
            max      : 10,
            min      : 2,
            idleTimeoutMillis : 30000,
            log : true
        });

    }

    /**
     * Log host+port details as well as the message.
     * @param level
     * @param message
     */
    function log(level, message) {
        message = 'SSHConnectionPool[' + self.options.host + ":" + self.options.port.toString() + "] " + message;
        Logger.log(level, message);
    }

    this.toString = function() {
        return 'Pool<' + self.options.username + '@' + self.options.host + ":" + self.options.port.toString();
    };

};

exports.SSHConnectionPool = SSHConnectionPool;
exports.VisionConnection = VisionConnection;
