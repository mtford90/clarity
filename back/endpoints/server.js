/**
 * Created by mtford on 16/02/2014.
 */


var response = require('./util/response');
var Logger = require('../config').logger;
var ssh = require('../lib/ssh');
var async = require('async');

// One-shot stats module
module.exports = function(mainApp, swagger){

    var express = require('express');

    function addServerConfigurationToSSHPool(newObj) {
        Logger.info('Configuring SSH Pool for ', newObj.name);
        var id = newObj._id;
        mainApp.sshPools[id] = new ssh.SSHConnectionPool(newObj);
    }

    swagger.addPost({
        spec: {
            description: 'Add a new server',
            method: 'POST',
            path: '/server',
            notes: 'Creates new server and initiates SSH pool',
            summary: 'Add a new server',
            type: 'Server',
            nickname: 'createNewServer'
        },
        action: function (req, res) {
            var server = req.body;
            Logger.debug('New server POSTed:', server.name);
            mainApp.db.addServer(server, function(err, newObj) {
                if (err) {
//                    throw swagger.errors.serverError(err);
                    response.serverError(res,err);
                }
                else {
                    addServerConfigurationToSSHPool(newObj);
                    response.success(res, newObj);
                }
            });
        }
    });

    mainApp.del('/server', function (req, res) {
        Logger.debug('Received request do delete all servers');
        mainApp.db.deleteServers(function (err) {
            if (err) {
                response.serverError(res,err);
            }
            else {
                mainApp.resetPools(function (err) {
                    if (err) {
                        response.serverError(res,err);
                    }
                    else {
                        response.success(res);
                    }
                });

            }
        })
    });

    function drainSSHPoolForServerId(id, callback) {
        mainApp.sshPools[id].drain(function (err) {
            if (!err) {
                delete mainApp.sshPools[id];
            }
            callback(err);
        });
    }

    mainApp.del('/server/:id', function (req, res) {
        var id = req.params.id;
        Logger.debug('Received request to delete server with identifier ' + id);
        mainApp.db.remove({_id:id}, function (err) {
            if (err) {
                response.serverError(res,err);
            }
            else {
                drainSSHPoolForServerId(id, function(err) {
                    if (err) {
                        response.serverError(res, err);
                    }
                    else {
                        response.success(res);
                    }
                });
            }
        });
    });

    mainApp.put('/server/:id', function (req, res) {
        var id = req.params.id;
        var server = req.body;
        mainApp.db.update({_id:id}, server, {}, function(err) {
            if (err) {
                response.serverError(res,err);
            }
            else { // TODO: Only drain and reconfigure if host/port etc changed, not name.
                drainSSHPoolForServerId(id, function(err) {
                    if (err) {
                        response.serverError(res, err);
                    }
                    else {
                        addServerConfigurationToSSHPool(server);
                        response.success(res);
                    }
                });
            }
        })
    });

};