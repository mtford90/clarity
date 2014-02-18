/**
 * Created by mtford on 18/02/2014.
 */

var async = require('async')
    , EventEmitter = require('events').EventEmitter
    , util = require('util')
    , Logger = require('../config').logger
    , ssh = require('./ssh')
    , _ = require('underscore');


/**
 * An event emitter that will emit server stats at a given rate.
 * @param sshPool - The pool of ssh connections from which to draw statistics.
 * @param {float} [rate] - The rate at which to collect statistics. Defaults to 1000ms (every 1 second)
 * @constructor
 */
var StatsMonitor = function (sshPool, rate) {
    if (!(this instanceof StatsMonitor))
        return new StatsMonitor(sshPool, rate);

    var self = this;
    EventEmitter.call(this);

    this.sshPool = sshPool;
    this.rate = rate;

    if (!this.rate) {
        this.rate = 1000; // Every second
    }

    this.start = function () {
        //noinspection JSUnresolvedFunction
        self.intervalIdentifiers = _.map([swapUsed, load], function (f) {
            return setInterval(f, self.rate);
        });
    };

    this.stop = function () {
        _.map(self.intervalIdentifiers, clearInterval);
    };

    function swapUsed () {
        if (Logger.debug) Logger.debug('Checking swap used');
        self.sshPool.oneShot(function(err, client) {
            if (err) self.emit('error', err);
            else {
                client.swapUsedPercentage(function(err, swapUsed) {
                    if (err) self.emit('error', err);
                    else self.emit('swapUsed', swapUsed);
                })
            }
        })
    }

    function load () { // TODO: Get current CPU rather than 1min avg.
        if (Logger.debug) Logger.debug('Checking avg load');
        self.sshPool.oneShot(function(err, client) {
            if (err) self.emit();
            else {
                client.averageLoad(function(err, load) {
                    if (err) self.emit('error', err);
                    else self.emit('cpuUsage', load[1]);
                });
            }
        });
    }

    // TODO: Memory usage

    // TODO: Pass paths to mounts and monitor historical disk space.

};

util.inherits(StatsMonitor, EventEmitter);

/**
 * Listens to a stats monitor and logs any output.
 * @param statsMonitor - An instance of StatsMonitor from which to listen
 * @constructor
 */
var LogStatsListener = function (statsMonitor) {
    if (!(this instanceof LogStatsListener))
        return new LogStatsListener(statsMonitor);

    this.start = statsMonitor.start;
    this.stop = statsMonitor.stop;

    statsMonitor.on('error', function(err) {
        Logger.error('Stats monitor returned error:',err);
    });

    statsMonitor.on('cpuUsage', function(cpuUsage) {
        Logger.info('CPU Usage:',cpuUsage);
    });

    statsMonitor.on('swapUsed', function (swapUsed) {
        Logger.info('Swap used:', swapUsed);
    });
};

///**
// *
// * @param statsMonitor
// * @param {Nedb} nedb - An instance of require('nedb')
// * @constructor
// */
//var NedbStatsListener = function (statsMonitor, nedb) {
//    if (!(this instanceof NedbStatsListener))
//        return new NedbStatsListener(statsMonitor);
//
//};

exports.StatsMonitor = StatsMonitor;
exports.LogStatsListener = LogStatsListener;

//var serverConfig = require('../tests/server/integration/config').server;
//
//var pool = new ssh.SSHConnectionPool(serverConfig);
//var monitor = new StatsMonitor(pool);
//var listener = new LogStatsListener(monitor);
//
//listener.start();
//listener.stop();
//pool.drain();