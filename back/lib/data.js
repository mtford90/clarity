/**
 * Created by mtford on 07/02/2014.
 */

var Config = require('../config').jsonConfig;
var Logger = require('../config').logger;
var fs = require('fs');
var util = require("util");

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

    var self = this;
    Nedb.call(this, dataFile);
    init();

    function init() {
        if (!self.dataFile) {
            self.dataFile = undefined;
            Logger.warn('No data directory specified, therefore will be in-memory');
            Logger.debug('In memory db therefore need to setup');
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

    function ensureIndices() {
        Logger.debug('Ensuring indices');
        self.ensureIndex({fieldName: 'username'}, function (err) {
            if (err) {
                Logger.error('Error ensuring index on username');
                throw err;
            }

        });
        self.ensureIndex({fieldName: 'serverId'}, function (err) {
            if (err) {
                Logger.error('Error ensuring index on serverId');
                throw err;
            }
        });
    }
};

util.inherits(ClarityDB, Nedb);


ClarityDB.prototype.addServer = function (name, host, port, privateKeyPath, callback) {
    var err;
    port = parseInt(port);
    if (typeof(name) != "string") err = 'name must be string type';
    else if (typeof(host) != "string") err = 'host must be string type';
    else if (typeof(privateKeyPath) != "string") err = 'key path must be string type';
    else if (!port) err = 'port is of invalid type';
    if (err && callback) {
        callback(err);
    }
    else {
        this.insert({
            name: name,
            host: host,
            port: port,
            privateKeyPath: privateKeyPath
        }, function (err, newDoc) {
            if (err) {
                Logger.error('Error inserting server: ', err);
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

exports.ClarityDB = ClarityDB;