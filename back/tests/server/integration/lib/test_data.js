/**
 * Created by mtford on 08/02/2014.
 */
/*global describe, it, before, beforeEach, after, afterEach */

var Logger = require('../../../../config.js').logger
    , expect = require("chai").expect
    , historical =  require('../../../../lib/historical')
    , ssh = require('../../../../lib/ssh')
    , serverConfig = require('../config').server
    , nedb =  require('nedb');

var sshConnPool = new ssh.SSHConnectionPool(serverConfig);

describe ('x', function () {

    var db;

    beforeEach(function () {
        db = new nedb();
    });

    it("spec name", function () {
    });

});



