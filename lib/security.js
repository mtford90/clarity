/**
 * Created by mtford on 01/02/2014.
 */

var Crypto = require('crypto');
var UUID = require('node-uuid');

exports.salt = function () {
    return UUID.v1();
};

exports.hash = function (raw, salt) {
    var h = Crypto.createHash('sha512');
    h.update(salt);
    h.update(raw);
    return h.digest('base64');
}