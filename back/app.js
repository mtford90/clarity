
/**
 * Module dependencies.
 */

var Logger = require('./config').logger;
var ssh = require('./lib/ssh');
var data = require('./lib/data');
var express = require('express');
var http = require('http');
var path = require('path');
var async = require('async');
var _ = require('underscore');

var app = express();

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'app'));
app.set('view engine', 'jade');
//app.use(express.favicon());
app.use(express.logger('dev'));

// Middleware stack
//app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(express.json());
app.use(express.urlencoded());
app.use(app.router);
app.use(express.static(path.join(__dirname, '../front/app')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

app.get('/', function(req, res) {
    var indexPath = path.resolve(__dirname + '/../front/app/index.html');
    Logger.info('Path is ' + indexPath);
    res.sendfile(indexPath);
});

/**
 * Drain all pools
 * @param callback
 */
app.resetPools = function (callback) {
    var pools = [];
    for (var key in app.sshPools) {
        //noinspection JSUnfilteredForInLoop
        pools.push(app.sshPools[key]);
    }
    async.each(pools, function (pool, eachCallback) {
        Logger.info('Clearing pool: ' + pool.toString());
        pool.drain(function (err) {
            if (err) {
                Logger.error('Error clearing pool: ', err);
            }
            else {
                Logger.info('Cleared pool: ' + pool.toString());
            }
            eachCallback(err);
        })
    }, function (err) {
        if (!err) {
            app.sshPools = {};
        }
        callback(err);
    });
};

app.clearDb = function (callback) {
    Logger.info('Clearing DB');
    app.db.clear(function (err) {
        if (err) {
            Logger.error('Error clearing db ', err);
        }
        else {
            Logger.info('Cleared DB');
        }
        callback(err);
    });
};

/**
 * Reset function used by unit + integration tests to clear out the DB and SSH pools.
 * @param callback
 */
app.reset = function (callback) {
    Logger.debug('Resetting app');

    async.parallel([
        app.clearDb,
        app.resetPools
    ], function (err) {
        if (err) throw err;
        else callback();
    });

};


initClarityBackend();

/**
 * Initalises the DB before then initalising SSH pools. Then calls setupApp
 */
function initClarityBackend() {
    var database = new data.ClarityDB();

    Logger.info('DB init successful, initalising ssh pools');

    database.getServers(function (err, servers) {
        if (err) {
            Logger.fatal('Unable to get servers from database');
            throw err;
        }
        else {
            Logger.info('SSH init successful, initialising http server');
            if (!servers.length) Logger.warn('No SSH servers configured');
            var sshPools = {};
            for (var i = 0; i < servers.length; i++) {
                var server = servers[i];
                Logger.info('Initalising SSH pool for', server.name);
                sshPools[server._id] = new ssh.SSHConnectionPool(server);
            }
            setupApp(sshPools, database);
        }
    });
}

/**
 * Setup individual express apps for each
 * @param sshPools
 * @param database
 */
function setupApp(sshPools, database) {
    var statsApp = require('./endpoints/stats');
    var serverApp = require('./endpoints/server');
    app.db = database;
    app.sshPools = sshPools;
    app.use('/server', statsApp(app));
    app.use('/server', serverApp(app));
    http.createServer(app).listen(app.get('port'), function () {
        console.log('Express server listening on port ' + app.get('port'));
    });
}

//database.addServer('46.51.201.85', 22, )

module.exports = app;