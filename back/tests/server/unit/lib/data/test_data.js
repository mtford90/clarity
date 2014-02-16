/**
 * Created by mtford on 08/02/2014.
 */
/*global describe, it, before, beforeEach, after, afterEach */

var Logger = require('../../../../../config.js').logger;
var expect = require("chai").expect;
var data =  require('../../../../../lib/data');

describe("Test in memory", function () {

    var db;

    beforeEach(function () {
        db = new data.ClarityDB();
    });

    it("test in memory var", function () {
        expect(db.inMemory).to.be.ok;
    });

    it("test data file", function () {
        expect(db.dataFile).to.not.be.ok;
    });


});

describe("Test on disk", function () {

    var db;

    beforeEach(function () {
        db = new data.ClarityDB('/tmp/clarity-data-test');
    });

    it("test in memory var", function () {
        expect(db.inMemory).to.not.be.ok;
    });

    it("test data file", function () {
        expect(db.dataFile).to.be.ok;
    });

});

describe("Invalid Requests", function () {

    var db = new data.ClarityDB();

    beforeEach(function () {
        db = new data.ClarityDB();
    });

    describe("Get", function () {

        it("Objects of unknown type", function (done) {
            db.getObjectsOfType('randomly-named-type', function (err, objects) {
                expect(err).to.be.ok;
                Logger.info('Received error', err);
                expect(objects).to.not.be.ok;
                done();
            });
        });

    });

    describe("delete", function () {

        it("Objects of unknown type", function (done) {
            db.deleteObjectsOfType('randomly-named-type', function (err, objects) {
                expect(err).to.be.ok;
                Logger.info('Received error', err);
                expect(objects).to.not.be.ok;
                done();
            });
        });

    });



});

describe("Manipulating stored servers", function () {

    var db;

    beforeEach(function () {
        db = new data.ClarityDB();
    });

    describe('End to end usage', function() {

        var server;

        beforeEach(function (done) {
            Logger.info('Setting up');
            db.addServer({
                name: 'local',
                host: 'localhost',
                port: 22,
                username: 'ubuntu',
                privateKeyPath: '/home/ubuntu/ssh/id_rsa/'
            }, function (err, newObj) {
                expect(err).to.not.be.ok;
                Logger.info('Created new server object', newObj);
                expect(newObj).to.be.ok;
                expect(newObj._type).to.equal(data.Types.server);
                server = newObj;
                done();
            });
        });

        afterEach(function (done) {
            Logger.info('Tearing down');
            server = undefined;
            db.clear(function (err) {
                if (err) Logger.error('Error when tearing down database: ', err);
                expect(err).to.not.be.ok;
                done();
            });
        });

        it("Creation and tearing down works fine", function (done) {
            done(); // Assertions are tested in beforeEach and afterEach
        });

        it("Get server by id", function (done) {
            db.getObject(server._id, function(err, obj) {
                expect(err).to.not.be.ok;
                expect(obj._id).to.equal(server._id);
                done();
            });
        });

        it("Deletion", function (done) {
            db.deleteObject(server._id, function(err) {
                expect(err).to.not.be.ok;
                db.getObject(server._id, function(err, obj) {
                    expect(err).to.not.be.ok;
                    expect(obj).to.not.be.ok;
                    done();
                });
            });
        });

        it("Get all servers", function (done) {
            db.addServer({
                name: 'anotherLocal',
                host: 'localhost',
                port: 22,
                username: 'ubuntu',
                privateKeyPath: '/home/ubuntu/ssh/id_rsa/'
            }, function (err, newObj) {
                expect(err).to.not.be.ok;
                expect(newObj).to.be.ok;
                Logger.info('Created new server object', newObj);
            });
            db.getServers(function (err, servers) {
                expect(err).to.not.be.ok;
                expect(servers).to.have.length(2);
                done();
            });
        });

        it("Delete all servers", function (done) {
            db.getServers(function (err, servers) {
                expect(err).to.not.be.ok;
                expect(servers).to.have.length.above(0);
                db.deleteServers(function (err) {
                    expect(err).to.not.be.ok;
                    db.getServers(function (err, servers) {
                        expect(err).to.not.be.ok;
                        expect(servers).to.have.length(0);
                        done();
                    });
                })
            });
        });

    });

    describe("Valid Usage", function () {

        afterEach(function (done) {
            Logger.info('Tearing down');
            db.clear(function (err) {
                if (err) Logger.error('Error when tearing down database: ', err);
                expect(err).to.not.be.ok;
                done();
            });
        });

        it("Port as string", function (done) {
            db.addServer({
                name: 'local',
                host: 'localhost',
                port:  "22",
                username: 'ubuntu',
                privateKeyPath: '/home/ubuntu/ssh/id_rsa/'
            }, function (err, newObj) {
                expect(err).to.not.be.ok;
                Logger.info('Created new server object', newObj);
                expect(newObj).to.be.ok;
                done();
            });
        });

    });

    describe("Invalid Usage", function () {

        it("invalid name", function (done) {
            db.addServer({
                name: 345345,
                host: 'localhost',
                port:  22,
                username: 'ubuntu',
                privateKeyPath: '/home/ubuntu/ssh/id_rsa/'
            },  function (err, newObj) {
                expect(err).to.be.ok;
                expect(newObj).to.not.be.ok;
                Logger.info('Error received: ', err);
                done();
            });
        });

        it("invalid host", function (done) {
            db.addServer({
                name: 'local',
                host: 3523542,
                port:  22,
                username: 'ubuntu',
                privateKeyPath: '/home/ubuntu/ssh/id_rsa/'
            }, function (err, newObj) {
                expect(err).to.be.ok;
                expect(newObj).to.not.be.ok;
                Logger.info('Error received: ', err);
                done();
            });
        });

        it("invalid port", function (done) {
            db.addServer({
                name: 'local',
                host: 'fdfs',
                port:  "asdasdasd",
                username: 'ubuntu',
                privateKeyPath: '/home/ubuntu/ssh/id_rsa/'
            },  function (err, newObj) {
                expect(err).to.be.ok;
                expect(newObj).to.not.be.ok;
                Logger.info('Error received: ', err);
                done();
            });
        });


        it("invalid path", function (done) {
            db.addServer({
                name: 'local',
                host: 'fdfs',
                port:  "asdasdasd",
                username: 'ubuntu',
                privateKeyPath: 5445
            }, function (err, newObj) {
                expect(err).to.be.ok;
                expect(newObj).to.not.be.ok;
                Logger.info('Error received: ', err);
                done();
            });
        });

    });

});