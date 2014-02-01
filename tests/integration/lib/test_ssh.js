/**
 * Created by mtford on 31/01/2014.
 */

SSH = require('../../../lib/ssh');
var Logger = require('../../../config').logger;

var options = {
    host: '46.51.201.85',
    port: 22,
    username: 'ubuntu',
    privateKey: require('fs').readFileSync('/Users/mtford/Dropbox/Drake/Server-Side/dev.pem')
};

module.exports = {
    'Test 1' : function(test) {
        Logger.error('Yo');
        var ssh = new SSH.SSHConnection(options);
        ssh.uptime(function () {
            ssh.close(function () {
                test.done();
            });
        });
    }
};