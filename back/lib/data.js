/**
 * Created by mtford on 07/02/2014.
 */

var Config = require('../config').jsonConfig;
var Logger = require('../config').logger;
var fs = require('fs');

var dataFile = Config.data;

if (!dataFile) {
    dataFile = undefined;
    Logger.warn('No data directory specified, therefore will be in-memory');
}
else {
    Logger.debug('Using database dir: ', dataFile);
}

var Nedb =  require('nedb');

function setupDatabase(DB) {
    Logger.info('Setting up database for first time');
    ensureIndices(DB);
}

function ensureIndices(DB) {
    Logger.debug('Ensuring indices');
    DB.ensureIndex({fieldName: 'username'}, function (err) {
        if (err) {
            Logger.error('Error ensuring index on username');
            throw err;
        }

    });

    DB.ensureIndex({fieldName: 'serverId'}, function (err) {
        if (err) {
            Logger.error('Error ensuring index on serverId');
            throw err;
        }
    });
}

var DB = new Nedb(dataFile);

if (dataFile) {
    if (fs.existsSync(dataFile)) {
        Logger.debug('Data file already exists at ' + dataFile + ' therefore no need to init')
    }
    else {
        setupDatabase(DB);
    }
}
else {
    Logger.debug('In memory database, therefore requires setup');
    setupDatabase(DB);
}

exports.DB = DB;

/**
 * Common procedures with which to hit the DB
 * @type {{}}
 */
var storedProcedures = {
    /**
     * Add a new server and validate the params
     * @param name
     * @param host
     * @param port
     * @param privateKeyPath
     * @param callback
     */
    addServer: function (name, host, port, privateKeyPath, callback) {
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
            DB.insert({
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
    }
};

exports.StoredProcedures = storedProcedures;

Logger.info('Adding new server');

storedProcedures.addServer('local', 'localhost', 22, '/home/ubuntu/ssh/id_rsa/', function (err, newObj) {
   if (err) {
       Logger.error('Error adding new server', err);
   }
   else {
       Logger.info('Added new object:', newObj);
   }
});
