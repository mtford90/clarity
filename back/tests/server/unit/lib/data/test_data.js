/**
 * Created by mtford on 08/02/2014.
 */
/*global describe, it, before, beforeEach, after, afterEach */

var Logger = require('../../../../../config.js').logger;
var expect = require("expect.js");
var data =  require('../../../../../lib/data');

describe("Test in memory", function () {

    var db = new data.ClarityDB();

    it("test in memory var", function () {
        expect(db.inMemory).to.be.ok();
    });

    it("test data file", function () {
        expect(db.dataFile).to.not.be.ok();
    });


});

describe("Test on disk", function () {

    var db = new data.ClarityDB('/tmp/clarity-data-test');

    it("test in memory var", function () {
        expect(db.inMemory).to.not.be.ok();
    });

    it("test data file", function () {
        expect(db.dataFile).to.be.ok();
    });

});

describe("Manipulating stored servers", function () {

    var db = new data.ClarityDB();

    describe('End to end usage', function() {

        var server;

        beforeEach(function (done) {
            Logger.info('Setting up');
            db.addServer('local', 'localhost', 22, '/home/ubuntu/ssh/id_rsa/', function (err, newObj) {
                expect(err).to.not.be.ok();
                Logger.info('Created new server object', newObj);
                expect(newObj).to.be.ok();
                server = newObj;
                done();
            });
        });

        afterEach(function (done) {
            Logger.info('Tearing down');
            server = undefined;
            db.clear(function (err) {
                if (err) Logger.error('Error when tearing down database: ', err);
                expect(err).to.not.be.ok();
                done();
            });
        });

        it("Creation and tearing down works fine", function (done) {
            done(); // Assertions are tested in beforeEach and afterEach
        });

        it("Get server by id", function (done) {
            db.getObject(server._id, function(err, obj) {
                expect(err).to.not.be.ok();
                expect(obj._id).to.equal(server._id);
                done();
            });
        });

        it("Deletion", function (done) {
            db.deleteObject(server._id, function(err) {
                expect(err).to.not.be.ok();
                db.getObject(server._id, function(err, obj) {
                    expect(err).to.not.be.ok();
                    expect(obj).to.not.be.ok();
                    done();
                });
            });
        });

    });

    describe("Valid Usage", function () {

        afterEach(function (done) {
            Logger.info('Tearing down');
            db.clear(function (err) {
                if (err) Logger.error('Error when tearing down database: ', err);
                expect(err).to.not.be.ok();
                done();
            });
        });

        it("Port as string", function (done) {
            db.addServer('local', 'localhost', "22", '/home/ubuntu/ssh/id_rsa/', function (err, newObj) {
                expect(err).to.not.be.ok();
                Logger.info('Created new server object', newObj);
                expect(newObj).to.be.ok();
                done();
            });
        });

    });

    describe("Invalid Usage", function () {

        it("invalid name", function (done) {
            db.addServer(345345, 'localhost', 22, '/home/ubuntu/ssh/id_rsa/', function (err, newObj) {
                expect(err).to.be.ok();
                expect(newObj).to.not.be.ok();
                Logger.info('Error received: ', err);
                done();
            });
        });

        it("invalid host", function (done) {
            db.addServer('name', 3523542, 22, '/home/ubuntu/ssh/id_rsa/', function (err, newObj) {
                expect(err).to.be.ok();
                expect(newObj).to.not.be.ok();
                Logger.info('Error received: ', err);
                done();
            });
        });

        it("invalid port", function (done) {
            db.addServer('name', 'localhost', 'sdfsdf', '/home/ubuntu/ssh/id_rsa/', function (err, newObj) {
                expect(err).to.be.ok();
                expect(newObj).to.not.be.ok();
                Logger.info('Error received: ', err);
                done();
            });
        });


        it("invalid path", function (done) {
            db.addServer('name', 'localhost', 22, 34534534, function (err, newObj) {
                expect(err).to.be.ok();
                expect(newObj).to.not.be.ok();
                Logger.info('Error received: ', err);
                done();
            });
        });

    });

});