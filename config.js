/**
 * Created by mtford on 31/01/2014.
 */

var Winston = require('winston');

exports.logger = new (Winston.Logger) ({
    transports: [
        new (Winston.transports.Console)({ json: false, timestamp: true, level: 'debug' })
    ],
//    exceptionHandlers: [
//        new (Winston.transports.Console)({ json: false, timestamp: true })
//    ],
    exitOnError: false
});