
/**
 * Module dependencies.
 */

var Logger = require('./config').logger;

var express = require('express');
var routes = require('./routes');
var user = require('./routes/user');
var http = require('http');
var path = require('path');
var ssh = require('./lib/ssh');

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

//var Data = require('./lib/data');
//
//Data.sequelize.sync().success(function() {

//app.defaultUser = Data.User.create({
//    user: 'default'
//}).success(function (user) {
//       Logger.info('Created default user', user);
//    });


statusCodes = {
    0: 'Unknown',
    1: 'Success',
    2: 'SSH Failure',
    3: 'No path specified'
};

function badRequest(res, errorCode, extra) {
    res.setHeader('Content-Type', 'application/json');
    res.status(400);
    var errorMessage = 'Unknown';
    if (errorCode in statusCodes) errorMessage = statusCodes[errorCode];
    var response_data = {
        error: {
            code: errorCode,
            message: errorMessage
        }
    };
    if (extra) response_data[error].extra = extra;
    res.end(JSON.stringify(response_data));
}

function success(res, data) {
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({
        data: data
    }));
}

app.sshPool = new ssh.SSHConnectionPool({
    host: '46.51.201.85',
    port: 22,
    username: 'ubuntu',
    privateKey: require('fs').readFileSync('/Users/mtford/Dropbox/Drake/Server-Side/dev.pem')
});

app.get('/', function(req, res) {
    var indexPath = path.resolve(__dirname + '/../front/app/index.html');
    Logger.info('Path is ' + indexPath);
    res.sendfile(indexPath);
});

app.get('/stats/swap', function (req, res) {
    app.sshPool.oneShot(function (err, client) {
        if (err) {
            Logger.error('Error getting swap used over ssh: ', err);
            badRequest(res,2);
        }
        else {
            client.swapUsedPercentage(function (error, perc) {
                if (error) {
                    Logger.error('Error getting swap used: ', err);
                    badRequest(res, 0);
                }
                else {
                    success(res,perc);
                }
            });
        }
    });
});

app.get('/stats/cpu', function (req, res) {
    app.sshPool.oneShot(function (err, client) {
        if (err) {
            Logger.error('Cannot execute one shot for cpu stat: ', err);
            badRequest(res, 2);
        }
        else {
            client.averageLoad(function (error, avg) {
                if (error) {
                    Logger.error('Error getting average load: ', error);
                    badRequest(res, 0);
                }
                else {
                    success(res,avg);
                }
            });
        }
    });
});

app.get('/stats/percUsed', function (req, res) {
    var path = req.query.path;
    if (!path) {
        badRequest(res, 3);
    }
    else {
        app.sshPool.oneShot(function (err, client) {
            if (err) {
                Logger.error('SSH error when getting percentage memory used:', err);
                badRequest(res, 2);
            }
            else {
                client.percentageUsed(path, function (error, data) {
                    if (error) {
                        Logger.error('Error calculating percentage used:', error);
                        badRequest(res, 0);
                    }
                    else {
                        success(res, data);
                    }
                });
            }

        });
    }
});


app.get('/stats/percFree', function (req, res) {
    var path = req.query.path;
    if (!path) {
        badRequest(res, 3);
    }
    else {
        app.sshPool.oneShot(function (err, client) {
            if (err) {
                Logger.error('SSH error when getting percentage memory free:', err);
                badRequest(res, 2);
            }
            else {
                client.percentageFree(path, function (error, data) {
                    if (error) {
                        Logger.error('Error when getting percentage memory free:', err)
                    }
                    else {
                        success(res, data);
                    }
                });
            }

        });
    }
});

//app.get('/users/default/grid', function (req, res) {
//    res.setHeader('Content-Type', 'application/json');
//    var grid = app.defaultUser.grid;
//    Logger.debug('Grid: ', grid);
//    res.end(grid ? grid.toString() : "");
//});
//
//app.put('/users/default/grid', function (req, res) {
//    var grid = JSON.stringify(req.body);
//    Logger.debug('raw body is ', grid);
//    app.defaultUser.grid = grid;
//    res.end();
//});

http.createServer(app).listen(app.get('port'), function(){
    console.log('Express server listening on port ' + app.get('port'));
});

module.exports = app;


