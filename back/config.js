/**
 * Created by mtford on 31/01/2014.
 */

var Winston = require('winston');

var Logger = new (Winston.Logger)({
    transports: [
        new (Winston.transports.Console)({ json: false, timestamp: true, level: 'debug' })
    ],
//    exceptionHandlers: [
//        new (Winston.transports.Console)({ json: false, timestamp: true })
//    ],
    exitOnError: false
});

exports.logger = Logger;

Logger.debug('Logging initialised');
Logger.debug('Reading config');

//noinspection JSUnresolvedVariable
var configFile = process.env.CLARITY_CONF;
if (!configFile) {
    configFile = __dirname + '/../clarity.conf.json';
    Logger.debug('CLARITY_CONF not specified, therefore using default: ' + configFile)
}

exports.jsonConfig = JSON.parse(require('fs').readFileSync(configFile));
