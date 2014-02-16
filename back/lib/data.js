/**
 * Created by mtford on 07/02/2014.
 */

var Config = require('../config').jsonConfig;
var Logger = require('../config').logger;
var fs = require('fs');
var util = require("util");
var utils = require('../lib/utils');

var dataFile = Config.data;

var Nedb =  require('nedb');

/**
 * Extends nedb with utilities and stored procedures for Clarity
 * @param {String} [dataFile] The data file is option. Will default to in memory.
 * @constructor
 */
var ClarityDB = function (dataFile) {

    this.dataFile = dataFile;
    this.inMemory = false;
    this.indexedFields = [{fieldName:'serverId'}, {fieldName:'_type'}];

    var self = this;
    Nedb.call(this, dataFile);
    init();

    function init() {
        if (!self.dataFile) {
            self.dataFile = undefined;
            Logger.warn('No data directory specified, therefore will be in-memory');
            Logger.debug('In memory db therefore need to initClarityBackend');
            self.inMemory = true;
            setupDatabase();
        }
        else {
            Logger.debug('Using database dir: ', dataFile);
            if (fs.exists(dataFile)) {
                Logger.debug('Database exists, no need to init');
            }
            else {
                setupDatabase();
            }
        }
    }

    function setupDatabase() {
        Logger.info('Setting up database');
        ensureIndices();
    }

    function ensureIndex(field) {
        Logger.debug('Ensuring index on ', field);
        self.ensureIndex(field, function (err) {
            if (err) {
                Logger.error('Error ensuring index on', field);
                throw err;
            }
        });
    }

    function ensureIndices() {
        Logger.debug('Ensuring indices');
        for (var i=0;i<self.indexedFields.length; i++) {
            ensureIndex(self.indexedFields[i]);
        }
    }
};

util.inherits(ClarityDB, Nedb);

ClarityDB.prototype.addServer = function (opts, callback) {

    var defaults = {
        name: 'unnamed',
        host: 'localhost',
        port: 22,
        username: 'ubuntu',
        password: '',
        privateKeyPath: ''
    };

    var server = utils.mergeOptions(defaults, opts);

    var err = undefined;
    server.port = parseInt(server.port);

    /**
     * Check types
     */
    function validate() { // TODO: This can be cleaner.
        if (typeof(server.name) != "string") err = 'name must be string type';
        else if (typeof(server.host) != "string") err = 'host must be string type';
        else if (typeof(server.username) != "string") err = 'username must be string type';
        else if (typeof(server.password) != "string") err = 'password must be string type';
        else if (typeof(server.privateKeyPath) != "string") err = 'key path must be string type';
        else if (!server.port) err = 'port is of invalid type';
    }

    validate();
    if (err && callback) {
        callback(err);
    }
    else {
        server._type = Types.server;
        this.insert(server, function (err, newDoc) {
            if (err) {
                Logger.error('Error inserting server', err);
            }
            else {
                Logger.info('Created new server: {0}<{1}@{2}:{3}>'.format(server.name,server.username,server.host,server.port.toString()))
            }
            if (callback) callback(err, newDoc);
        });
    }
};

ClarityDB.prototype.clear = function (callback) {
    this.remove({}, {}, function(err, numRemoved) {
        if (err) {
            Logger.error('Error clearing database: ', err);
        }
        else {
            Logger.info('Cleared database, removing ' + numRemoved.toString() + ' objects');
        }
        if (callback) callback(err);
    });
};

ClarityDB.prototype.deleteObject = function(id, callback) {
    this.remove({_id:id}, {}, function(err) {
        if (err) {
            Logger.error('Error deleting object with id ' + id);
        }
        if (callback) callback(err);
    })
};

ClarityDB.prototype.getObject = function(id, callback) {
    this.find({_id:id}, function (err, docs) {
        if (err) {
            Logger.error('Error finding object with id: ', err);
            if (callback) callback(err);
        }
        else if (docs.length > 1) {
            err = 'More than one object with id: ';
            Logger.error(err);
            if (callback) callback(err);
        }
        else if (callback.length) {
            callback(null, docs[0]);
        }
        else {
            callback(null, null);
        }
    });
};

ClarityDB.prototype.getObjectsOfType = function(type, callback) {
    if (!(type in Types)) {
        callback("Unknown type " + type);
    }
    else {
        this.find({_type: type}, function (err, objects) {
            if (err) {
                Logger.error('Error getting objects of type');
            }
            callback(err, objects);
        })
    }
};

ClarityDB.prototype.deleteObjectsOfType = function(type, callback) {
    if (!(type in Types)) {
        callback("Unknown type " + type);
    }
    else {
        this.remove({_type: type}, function (err, numRemoved) {
            if (err) {
                Logger.error('Error deleting objects of type', type);
            }
            else {
                Logger.info('Deleted ' + numRemoved.toString() + ' objects of type ' + type);
            }
            callback(err);
        });
    }
};

ClarityDB.prototype.getServers = function(callback) {
    this.getObjectsOfType(Types.server, callback);
};


ClarityDB.prototype.deleteServers = function(callback) {
    this.deleteObjectsOfType(Types.server, callback);
};



exports.ClarityDB = ClarityDB;

var Types = {
    server: 'server'
};
exports.Types = Types;