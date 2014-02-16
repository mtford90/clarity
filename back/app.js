
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


app.use('/stats', require('./endpoints/stats'));


app.get('/', function(req, res) {
    var indexPath = path.resolve(__dirname + '/../front/app/index.html');
    Logger.info('Path is ' + indexPath);
    res.sendfile(indexPath);
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


