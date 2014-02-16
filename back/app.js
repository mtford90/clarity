
/**
 * Module dependencies.
 */

var Logger = require('./config').logger;

var express = require('express');
var http = require('http');
var path = require('path');

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


app.get('/', function(req, res) {
    var indexPath = path.resolve(__dirname + '/../front/app/index.html');
    Logger.info('Path is ' + indexPath);
    res.sendfile(indexPath);
});

var ssh = require('./lib/ssh');
var data = require('./lib/data');

var sshPool = new ssh.SSHConnectionPool({
    host: '46.51.201.85',
    port: 22,
    username: 'ubuntu',
    privateKey: require('fs').readFileSync('/Users/mtford/Dropbox/Drake/Server-Side/dev.pem')
//    privateKey: require('fs').readFileSync('/home/clarity/mosayc.pem')
});
var database = new data.ClarityDB();

//database.addServer('46.51.201.85', 22, )

var statsApp = require('./endpoints/stats');
var serverApp = require('./endpoints/server');


statsApp.sshPool = sshPool;
statsApp.db = database;


//app.sshPool = sshPool;

app.use('/stats', statsApp);


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


