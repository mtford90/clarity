/**
 * Created by mtford on 31/01/2014.
 */

var Connection = require('ssh2');
var Fs = require('fs');
var Util = require('./utils');
var Logger = require('./../config').logger;
var poolModule = require('generic-pool');
var _ = require('underscore');

/**
 * Provides access to pool of ssh connections with basic system inspection methods
 * @param options
 * @constructor
 */
exports.SSHConnection = function(options) {

    var self = this;

    // The below specifies available options + defaults
    var defaultOptions = {
        host: '',
        port: null,
        username: '',
        privateKey: null
    };

    init();

    /**
     * Get percentage swap used as a float
     * @param callback
     */
    this.swapUsedPercentage = function (callback) {
        self.memoryInfo(function (err, info) {
            if (err) callback(err, null);
            callback(null,info[self.memInfoKey.SwapFree]  / info[self.memInfoKey.SwapTotal]);
        })
    };

    /**
     * Takes average load over 1 minute, 5 minutes and 15 minutes from uptime command
     * @param callback
     */
    this.averageLoad = function (callback) {
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
    this.memoryInfo = function (callback) {
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
        })
    };


    /**
     * Terminates all ssh connections in the pool.
     * @param callback
     */
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

    /**
     * Acquire an ssh connection from the pool and execute the given command
     * @param exec_str
     * @param callback
     */
    this.execute = function (exec_str, callback) {
        self.pool.acquire(function(err, client) {
            if (err) callback(err, null);
            client.exec(exec_str, function (err, stream) {
                stream.on('data', function (data, extended) {
                    if (extended === 'stderr') {
                        callback (data, null);
                    }
                    else {
                        callback (null, data.toString());
                    }
                    self.pool.release(client);
                });
            });
        })
    };

    /**
     * Initialise connection pool
     */
    function init () {
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
        message = 'SSHConnection[' + self.options.host + ":" + self.options.port.toString() + "] " + message;
        Logger.log(level, message);
    }

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