/**
 * Created by mtford on 08/02/2014.
 */
/* global describe, it, before, beforeEach, after, afterEach */

var Logger = require('../../../../config.js').logger
    , expect = require("chai").expect
    , serverConfig = require('../config').server
    , utils = require('../../../../lib/utils')
    , SSH = require('../../../../lib/ssh');

var pool = new SSH.SSHConnectionPool(serverConfig);

const REGEX_FLOAT = /^[0-9]*[.][0-9]+$/;
const REGEX_FLOAT_OR_INT = /^[0-9]*([.][0-9]+)?$/;

describe('Stats', function() {

    it("Raw Mem Info", function (done) {
        pool.oneShot(function(err, client) {
            expect(err).to.not.be.ok;
            expect(client).to.be.ok;
            client.memoryInfo(function (error, data) {
                expect(error).to.not.be.ok;
                expect(data).to.be.ok;
                Logger.info('Raw mem info: ', data);
                var keys = Object.keys(client.memInfoKey);
                for (var i=0;i<keys.length;i++) {
                    var key = keys[i];
                    Logger.debug('Testing for existence of ' + key + ' in mem info');
                    expect(data).to.have.ownProperty(key);
                }
                done();
            });
        });
    });

    it("Swap Used", function (done) {
        pool.oneShot(function(err, client) {
            expect(err).to.not.be.ok;
            expect(client).to.be.ok;
            client.swapUsedPercentage(function (error, perc) {
                expect(error).to.not.be.ok;
                expect(perc).to.match(REGEX_FLOAT_OR_INT);
                Logger.info('Swap percentage used: ', perc);
                done();
            });
        });
    });

    it("Memory Used", function (done) {
        pool.oneShot(function(err, client) {
            expect(err).to.not.be.ok;
            expect(client).to.be.ok;
            client.memoryUsed(function (error, memUsed) {
                expect(error).to.not.be.ok;
                expect(memUsed).to.match(REGEX_FLOAT_OR_INT);
                Logger.info('Mem percentage used: ', memUsed);
                done();
            });
        });
    });

    it("Average Load", function (done) {
        pool.oneShot(function(err, client) {
            expect(err).to.not.be.ok;
            expect(client).to.be.ok;
            client.averageLoad(function (error, averageLoad) {
                expect(error).to.not.be.ok;
                expect(averageLoad).to.be.ok;
                Logger.info('Average load: ', averageLoad);
                expect(averageLoad).to.have.ownProperty(1);
                expect(averageLoad).to.have.ownProperty(5);
                expect(averageLoad).to.have.ownProperty(15);
                expect(averageLoad[1]).to.match(REGEX_FLOAT_OR_INT);
                expect(averageLoad[5]).to.match(REGEX_FLOAT_OR_INT);
                expect(averageLoad[15]).to.match(REGEX_FLOAT_OR_INT);
                done();
            });
        });
    });

    it("Diskspace Used", function (done) {
        pool.oneShot(function(err, client) {
            expect(err).to.not.be.ok;
            expect(client).to.be.ok;
            client.percentageUsed('/home/ubuntu', function (error, percentageUsed) {
                expect(error).to.not.be.ok;
                Logger.info('percentageUsed: ', percentageUsed);
                expect(percentageUsed).to.match(REGEX_FLOAT_OR_INT);
                done();
            });
        });
    });

    it("Diskspace Free", function (done) {
        pool.oneShot(function(err, client) {
            expect(err).to.not.be.ok;
            expect(client).to.be.ok;
            client.percentageFree('/home/ubuntu', function (error, percentageFree) {
                expect(error).to.not.be.ok;
                Logger.info('percentageFree: ', percentageFree);
                expect(percentageFree).to.match(REGEX_FLOAT_OR_INT);
                done();
            });
        });
    });

    it("CPU usage", function (done) {
        pool.oneShot(function(err, client) {
            expect(err).to.not.be.ok;
            expect(client).to.be.ok;
            client.cpuUsage(function (error, cpuUsage) {
                expect(error).to.not.be.ok;
                Logger.info('cpuUsage: ', cpuUsage);
                expect(cpuUsage).to.match(REGEX_FLOAT_OR_INT);
                done();
            });
        });
    });

});

after(function (done) {
    pool.drain(function () {
        done();
    });
});
