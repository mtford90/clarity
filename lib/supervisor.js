/**
 * Created by mtford on 01/02/2014.
 */

var _ = require('underscore');

var Logger = require('./../config').logger;

exports.Supervisor = function (ssh_pool, config_path) {
    var self = this;

    this.ssh_pool = ssh_pool;
    this.config_path = config_path;

    this.status = function (callback) {
        var cmd = 'sudo supervisorctl';
        if (self.config_path) cmd += ' -c ' + self.config_path;
        cmd += ' status';
        Logger.debug('Executing the following supervisor cmd: ',cmd);
        this.ssh_pool.execute(cmd, function(err, data) {
            if (err) callback(err, null);
            var lines = data.split('\n');
            lines = _.map(lines, function(x) {return x.split(/\s+/g)});
            var status = _.reduce(lines, function (memo, x) {
                var processName = x[0];
                var status = x[1];
                var dict = {
                    processName: processName,
                    status: status,
                    pid: null,
                    uptime: null,
                    stoptime: null
                };
                var restOf = _.rest(x, 2);
                if (status == 'RUNNING') {
                    var pid = restOf[1];
                    pid = parseInt(pid.substring(0, pid.length-1));
                    dict.pid = pid;
                    dict.uptime = _.rest(restOf, 3).join(' ')
                }
                else if (status == 'STOPPED' || status == 'EXITED') {
                    dict.stoptime = restOf.join(' ');
                }
                else {

                    // Process never started or status unknown.
                }
                memo[processName] = dict;
                return memo;
            }, {});
            callback(null, status);
        });
    }
};