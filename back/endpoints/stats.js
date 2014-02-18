/**
 * Created by mtford on 16/02/2014.
 */

var response = require('./util/response');
var Logger = require('../config').logger;

// One-shot stats module
module.exports = function(mainApp){

    var express = require('express');
    var app = express();

    app.get('/:id/stats/swap', function (req, res) {
        var id = req.params.id;
        Logger.debug('Received request for swap for ident',id);
        var sshPool = mainApp.sshPools[ id];
        sshPool.oneShot(function (err, client) {
            if (err) {
                Logger.error('Error getting swap used over ssh: ', err);
                response.badRequest(res,2);
            }
            else {
                client.swapUsedPercentage(function (error, perc) {
                    if (error) {
                        Logger.error('Error getting swap used: ', err);
                        response.badRequest(res, 0);
                    }
                    else {
                        response.success(res,perc);
                    }
                });
            }
        });
    });

    app.get('/:id/stats/cpu', function (req, res) {
        var sshPool = mainApp.sshPools[req.params.id];
        sshPool.oneShot(function (err, client) {
            if (err) {
                Logger.error('Cannot execute one shot for cpu stat: ', err);
                response.badRequest(res, 2);
            }
            else {
                client.averageLoad(function (error, avg) {
                    if (error) {
                        Logger.error('Error getting average load: ', error);
                        response.badRequest(res, 0);
                    }
                    else {
                        response.success(res,avg);
                    }
                });
            }
        });
    });

    app.get('/:id/stats/percUsed', function (req, res) {
        var path = req.query.path;
        if (!path) {
            response.badRequest(res, 3);
        }
        else {
            var sshPool = mainApp.sshPools[req.params.id];
            sshPool.oneShot(function (err, client) {
                if (err) {
                    Logger.error('SSH error when getting percentage memory used:', err);
                    response.badRequest(res, 2);
                }
                else {
                    client.percentageUsed(path, function (error, data) {
                        if (error) {
                            Logger.error('Error calculating percentage used:', error);
                            response.badRequest(res, 0);
                        }
                        else {
                            response.success(res, data);
                        }
                    });
                }

            });
        }
    });

    app.get('/:id/stats/percFree', function (req, res) {
        var path = req.query.path;
        if (!path) {
            response.badRequest(res, 3);
        }
        else {
            var sshPool = mainApp.sshPools[req.params.id];
            sshPool.oneShot(function (err, client) {
                if (err) {
                    Logger.error('SSH error when getting percentage memory free:', err);
                    response.badRequest(res, 2);
                }
                else {
                    client.percentageFree(path, function (error, data) {
                        if (error) {
                            Logger.error('Error when getting percentage memory free:', err)
                        }
                        else {
                            response.success(res, data);
                        }
                    });
                }
            });
        }
    });

    return app;

};