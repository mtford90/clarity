/**
 * Created by mtford on 16/02/2014.
 */


var response = require('./util/response');
var Logger = require('../config').logger;
var express = require('express');

// One-shot stats module
module.exports = function(mainApp){

    var app = express();

//    app.get('/', function (req, res) {
//        res.setHeader('Content-Type', 'application/json');
//        var grid = app.defaultUser.grid;
//        Logger.debug('Grid: ', grid);
//        res.end(grid ? grid.toString() : "");
//    });
//
//    app.post('/', function (req, res) {
//        mainApp.insert(req.body, function (err, newDoc) {
//            if (err) {
//
//            }
//        });
//        res.end();
//    });
    return app;

};