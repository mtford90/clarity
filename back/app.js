
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

app.sshPool = new ssh.SSHConnectionPool({
    host: '46.51.201.85',
    port: 22,
    username: 'ubuntu',
    privateKey: require('fs').readFileSync('/home/clarity/mosayc.pem')
});

app.get('/', function(req, res) {
    var indexPath = path.resolve(__dirname + '/../front/app/index.html');
    Logger.info('Path is ' + indexPath);
    res.sendfile(indexPath);
});

app.get('/stats/swap', function (req, res) {
    app.sshPool.oneShot(function (err, client) {
        client.swapUsedPercentage(function (error, perc) {
            success(res,perc);
        });
    });
});

app.get('/stats/cpu', function (req, res) {
    app.sshPool.oneShot(function (err, client) {
        client.averageLoad(function (error, avg) {
            success(res,avg);
        });
    });
});

app.get('/stats/percUsed', function (req, res) {
    var path = req.query.path;
    if (!path) {
        badRequest(res, 'Need to give a path');
    }
    else {
        app.sshPool.oneShot(function (err, client) {
            client.percentageUsed(path, function (error, data) {
                success(res, data);
            });
        });
    }
});

function badRequest(res, errorMessage) {
    res.setHeader('Content-Type', 'application/json');
    res.status(400);
    res.end(JSON.stringify({
        'error': errorMessage
    }))
}

function success(res, data) {
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({
        data: data
    }));
}

app.get('/stats/percFree', function (req, res) {
    var path = req.query.path;
    if (!path) {
        badRequest(res, 'Need to give a path');
    }
    else {
        app.sshPool.oneShot(function (err, client) {
            client.percentageFree(path, function (error, data) {
                success(res, data);
            });
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


