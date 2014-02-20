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
var statsMonitor = new historical.StatsMonitor(sshConnPool, ['/home/ubuntu']);

const REGEX_FLOAT = /^[0-9]*[.][0-9]+$/;
const REGEX_FLOAT_OR_INT = /^[0-9]*([.][0-9]+)?$/;

before(function () {
    statsMonitor.start();
});

describe ('StatsMonitor', function () {

    it("tests emits swapUsed", function (done) {
        statsMonitor.once('swapUsed', function(cpuUsage) {
            expect(cpuUsage).to.match(REGEX_FLOAT_OR_INT);
            done();
        });
    });

    it("tests emits cpuUsage", function (done) {
        statsMonitor.once('cpuUsage', function(cpuUsage) {
            expect(cpuUsage).to.match(REGEX_FLOAT_OR_INT);
            done();
        });
    });

    it("tests emits memoryUsage", function (done) {
        statsMonitor.once('memoryUsed', function(memoryUsed) {
            expect(memoryUsed).to.match(REGEX_FLOAT_OR_INT);
            done();
        });
    });

    it("tests emits diskSpaceUsed", function (done) {
        statsMonitor.once('diskSpaceUsed', function(diskSpaceUsed) {
            expect(diskSpaceUsed).to.have.property('/home/ubuntu');
            expect(diskSpaceUsed['/home/ubuntu']).to.match(REGEX_FLOAT_OR_INT);
            done();
        });
    });

});

describe("Statistic Collection & Analysis", function () {

    var db;
    var listener;
    var types = historical.NedbStatsListener.types;

    before(function () {
        Logger.info('Creating in memory db');
        db = new nedb(); // In memory nedb.
        listener = new historical.NedbStatsListener(statsMonitor, db);
    });

    after(function () {
        listener.stop();
    });

    describe("NedbStatsListener", function () {

        /**
         * Take documents returned from nedb and verify NedbStatsListener is populating correctly
         * @param docs
         */
        function verifyDocs(docs) {
            expect(docs).to.have.length.above(0);
            Logger.info('db has docs: ', docs);
            for (var i = 0; i < docs.length; i++) {
                var doc = docs[i];
                expect(doc).to.have.ownProperty('host');
                expect(doc).to.have.ownProperty('value');
                expect(doc).to.have.ownProperty('type');
                expect(doc).to.have.ownProperty('date');
            }
        }

        it("tests captures swapUsed", function (done) {
            statsMonitor.once('swapUsed', function() {
                db.find({type: types.swapUsed}, function(err, docs) {
                    expect(err).to.not.be.ok;
                    verifyDocs(docs);
                    done();
                });
            })
        });

        it("tests captures cpuUsage", function (done) {
            statsMonitor.once('cpuUsage', function() {
                db.find({type: types.cpuUsage}, function(err, docs) {
                    expect(err).to.not.be.ok;
                    verifyDocs(docs);
                    done();
                });
            });
        });


        it("tests captures memoryUsed", function (done) {
            statsMonitor.once('memoryUsed', function() {
                db.find({type: types.memoryUsed}, function(err, docs) {
                    expect(err).to.not.be.ok;
                    verifyDocs(docs);
                    done();
                });
            });
        });

        it("tests captures disk usage", function (done) {
            statsMonitor.once('diskSpaceUsed', function() {
                db.find({type: types.diskSpaceUsed}, function(err, docs) {
                    expect(err).to.not.be.ok;
                    verifyDocs(docs);
                    for (var i=0;i<docs.length;i++) {
                        var doc = docs[i];
                        expect(doc).to.have.ownProperty('path');
                    }
                    done();
                });
            });
        });

    });

    describe("Analytics", function () {

        var analytics;

        before(function (done) {
            analytics = new historical.Analytics(db);
            setTimeout(function () { // Let some stats build up in the db.
                done();
            }, 3000);
        });

        describe("date ranges", function () {

            function validateResults(results) {
                for (var i = 0; i < results.length; i++) {
                    var result = results[i];
                    expect(result).to.have.property('date');
                    expect(result.date).to.be.an.instanceOf(Date);
                    expect(result).to.have.property('value');
                    expect(result.value).to.match(REGEX_FLOAT_OR_INT);
                }
            }

            describe("no date specified", function () {

                it("cpuUsage", function (done) {
                    analytics.cpuUsage(null, null, function(err, results) {
                        expect(err).to.not.be.ok;
                        expect(results).to.have.length.above(0);
                        validateResults(results);
                        done();
                    });
                });

                it("swapUsage", function (done) {
                    analytics.swapUsage(null, null, function(err, results) {
                        expect(err).to.not.be.ok;
                        expect(results).to.have.length.above(0);
                        validateResults(results);
                        done();
                    });
                });

                it("meanCpuUsage", function (done) {
                    analytics.meanCpuUsage(null, null, function (err, result) {
                        expect(err).to.not.be.ok;
                        expect(result).to.match(REGEX_FLOAT_OR_INT);
                        done();
                    });
                });

            });

            describe("date specified", function () {

                var startDate;
                var endDate;

                before(function (done) {
                    startDate = new Date();
                    analytics = new historical.Analytics(db);
                    setTimeout(function () { // Let some stats build up in the db.
                        endDate = new Date();
                        setTimeout(function () { // Let some other stats build up.
                            done();
                        }, 3000);
                    }, 3000);
                });

                it("cpuUsage", function (done) {
                    analytics.cpuUsage(startDate, endDate, function(err, results) {
                        expect(err).to.not.be.ok;
                        expect(results).to.have.length.above(0);
                        validateResults(results);
                        validateDatesOfResults(results);
                        done();
                    });
                });

                function validateDatesOfResults(results) {
                    for (var i = 0; i < results.length; i++) {
                        var result = results[i];
                        expect(result.date).to.be.below(endDate);
                        expect(result.date).to.be.above(startDate);
                    }
                }

                it("swapUsage", function (done) {
                    analytics.swapUsage(startDate, endDate, function(err, results) {
                        expect(err).to.not.be.ok;
                        expect(results).to.have.length.above(0);
                        validateResults(results);
                        validateDatesOfResults(results);
                        done();
                    });
                });

                it("meanCpuUsage", function (done) {
                    analytics.meanCpuUsage(startDate, endDate, function (err, result) {
                        expect(err).to.not.be.ok;
                        expect(result).to.match(REGEX_FLOAT_OR_INT);
                        done();
                    });
                });

            });

        });

        describe("other", function () {

        });

    });

});

after(function (done) {
    Logger.info('Draining SSH pool');
    statsMonitor.stop();
    sshConnPool.drain(function () {
        done();
    });
});