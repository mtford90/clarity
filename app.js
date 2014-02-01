
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
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
//app.use(express.favicon());
app.use(express.logger('dev'));

// Middleware stack
//app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(express.json());
app.use(express.urlencoded());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

var Data = require('./lib/data');

Data.sequelize.sync().success(function() {

    app.defaultUser = Data.User.create({
        user: 'default'
    }).success(function (user) {
           Logger.info('Created default user', user);
        });

    app.sshPool = ssh.SSHConnection({
        host: '46.51.201.85',
        port: 22,
        username: 'ubuntu',
        privateKey: require('fs').readFileSync('/Users/mtford/Dropbox/Drake/Server-Side/dev.pem')
    });

    app.get('/', routes.index);

    app.get('/users', user.list);

    app.get('/stats/swap', function (req, res) {
        ssh.swapUsedPercentage(function (error, perc) {
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ a: perc }));
        });
    });

    app.get('/stats/cpu', function (req, res) {
        ssh.averageLoad(function (error, avg) {
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify(avg));
        });
    });

    app.get('/users/default/grid', function (req, res) {
        res.setHeader('Content-Type', 'application/json');
        var grid = app.defaultUser.grid;
        Logger.debug('Grid: ', grid);
        res.end(grid ? grid.toString() : "");
    });

    app.put('/users/default/grid', function (req, res, next) {
        var grid = JSON.stringify(req.body);
        Logger.debug('raw body is ', grid);
        app.defaultUser.grid = grid;
        res.end();
    });

    http.createServer(app).listen(app.get('port'), function(){
        console.log('Express server listening on port ' + app.get('port'));
    });

});


