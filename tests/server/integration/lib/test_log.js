/**
 * Created by mtford on 01/02/2014.
 */

var SSH = require('../../../../lib/ssh');
var Utils = require('../../../../lib/utils');
var Logger = require('../../../../config').logger;
var Supervisor = require('../../../../lib/supervisor');
var LogMonitor = require('../../../../lib/log-monitor');

var options = {
    host: '46.51.201.85',
    port: 22,
    username: 'ubuntu',
    privateKey: require('fs').readFileSync('/Users/mtford/Dropbox/Drake/Server-Side/dev.pem')
};


module.exports = {

    'Test Logging': function (test) {
        var sshPool = new SSH.SSHConnectionPool(options);
        sshPool.execute('echo "blah" > /tmp/test.log', function (err, data) {
            test.ok(!err, 'Error creating log file: ', err);
            sshPool.drain(function () {
                test.done();
            });
        });
//        var logMonitor = new LogMonitor(sshPool, '/home/ubuntu/waiting-list/logs');

    }

};