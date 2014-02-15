/**
 * Created by mtford on 31/01/2014.
 */

var SSH = require('../../../../lib/ssh');
var Utils = require('../../../../lib/utils');
var Logger = require('../../../../config').logger;

var options = {
    host: '46.51.201.85',
    port: 22,
    username: 'ubuntu',
    privateKey: require('fs').readFileSync('/Users/mtford/Dropbox/Drake/Server-Side/dev.pem')
};


module.exports = {

    'Test Raw Mem Info': function (test) {
        var pool = new SSH.SSHConnectionPool(options);
        pool.oneShot(function(err, client) {
            test.ok(!err, 'Error acquiring a client: ' + err);
            test.ok(client != null, 'No client returned');


            client.memoryInfo(function (error, data) {
                test.ok(!error, 'Error returned: ' + error);
                test.ok(data, 'Failed to get any data');
                Logger.info('Raw mem info: ', data);
                var keys = Object.keys(client.memInfoKey);
                for (var i=0;i<keys.length;i++) {
                    var key = keys[i];
                    Logger.debug('Testing for existence of ' + key + ' in mem info');
                    test.ok(key in data, key + ' not present in mem info');
                    test.ok(typeof data[key] === 'number');
                }
                pool.drain(function () {
                    test.done();
                });
            });
        });
    },

    'Test Swap Used': function (test) {
        var pool = new SSH.SSHConnectionPool(options);
        pool.oneShot(function(err, client) {
            test.ok(!err, 'Error acquiring a client: ' + err);
            client.swapUsedPercentage(function (error, perc) {
                test.ok(!error, 'Error returned: ' + error);
                test.ok(perc, 'Failed to get percentage swap');
                test.ok(Utils.isFloat(perc), 'Percentage isnt a float');
                Logger.info('Swap percentage used: ', perc);
                pool.drain(function () {
                    test.done();
                });
            });
        });

    },

    'Test Average Load': function(test) {
        var pool = new SSH.SSHConnectionPool(options);
        pool.oneShot(function(err, client) {
            test.ok(!err, 'Error acquiring a client: ' + err);
            client.averageLoad(function (error, averageLoad) {
                test.ok(!error, 'Error returned: ' + error);
                test.ok(averageLoad, 'Failed to get average load');
                Logger.info('Average load: ', averageLoad);
                test.ok(1 in averageLoad, '1 minute average not available');
                test.ok(5 in averageLoad, '5 minute average not available');
                test.ok(15 in averageLoad, '15 minute average not available');

                test.ok(Utils.isFloat(averageLoad[1]), '1 minute average is of incorrect type');
                test.ok(Utils.isFloat(averageLoad[5]), '5 minute average is of incorrect type');
                test.ok(Utils.isFloat(averageLoad[15]), '15 minute average is of incorrect type');
                pool.drain(function () {
                    test.done();
                });
            });
        });
    },

    'Test Percentage Diskspace Used': function(test) {
        var pool = new SSH.SSHConnectionPool(options);
        pool.oneShot(function(err, client) {
            test.ok(!err, 'Error acquiring a client: ' + err);
            client.percentageUsed('/home/ubuntu', function (error, percentageUsed) {
                test.ok(!error, 'Error returned: ' + error);
                test.ok(percentageUsed, 'Failed to get data');
                Logger.info('percentageUsed: ', percentageUsed);
                test.ok(Utils.isFloat(percentageUsed), 'percentageUsed is of incorrect type');
                pool.drain(function () {
                    test.done();
                });
            });
        });
    },

    'Test Percentage Diskspace Free': function(test) {
        var pool = new SSH.SSHConnectionPool(options);
        pool.oneShot(function(err, client) {
            test.ok(!err, 'Error acquiring a client: ' + err);
            client.percentageFree('/home/ubuntu', function (error, percentageFree) {
                test.ok(!error, 'Error returned: ' + error);
                test.ok(percentageFree, 'Failed to get data');
                Logger.info('percentageFree: ', percentageFree);
                test.ok(Utils.isFloat(percentageFree), 'percentageFree is of incorrect type');
                pool.drain(function () {
                    test.done();
                });
            });
        });
    }

};