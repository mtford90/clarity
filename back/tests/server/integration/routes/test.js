/**
 * Created by mtford on 08/02/2014.
 */
/*global describe, it, before, beforeEach, after, afterEach */

var request = require('supertest');
var app = require("../../../../app");
var expect = require('chai').expect;
var config = require('../config');
var Logger = require('../../../../config').logger;
var data = require('../../../../lib/data');
var utils = require('../../../../lib/utils');

const REGEX_FLOAT = /^[0-9]*[.][0-9]+$/;
const REGEX_FLOAT_OR_INT = /^[0-9]*([.][0-9]+)?$/;

describe("routes", function () {

    var server;

    function postServer(callback) {
        request(app)
            .post('/server')
            .set('Content-Type', 'application/json')
            .send( config.server)
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(200)
            .end(function (err, res) {
                var data = res.body.data;
                expect(data).to.be.ok;
                expect(data).to.have.ownProperty('_id');
                server = data;
                if (callback) callback();
            });
    }

    beforeEach(function (done) {
        app.reset(function () {
            postServer(done);
        });
    });

    describe('POST /server', function () {

        it("Valid", function (done) {
            done(); // Check beforeeach succeeds
        });

        it("Now has an ssh pool for the new server", function(done) {
            expect(app.sshPools).to.have.ownProperty(server._id);
            done();
        });

    });

    describe('DEL /server', function () {

        beforeEach(function (done) {
            request(app)
                .del('/server')
                 .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(200)
                .end(function (err, res) {
                    expect(err).to.not.be.ok;
                    app.db.getServers(function (err, servers) {
                        if (servers) {
                            Logger.error('Expected no servers but got ', servers.name, servers.host);
                        }
                        expect(err).to.not.be.ok;
                        expect(Object.getOwnPropertyNames(app.sshPools)).to.have.length(0);
                        expect(servers).to.have.length(0);
                        done();
                    });
                });
        });

        it("Valid", function (done) {
            done(); // Check beforeeach succeeds
        });



    });

    describe('DEL /server/:id', function () {

        beforeEach(function (done) {
//            expect(app.sshPools).to.have.ownProperty(server._id);
            request(app)
                .del('/server/'+server._id)
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(200)
                .end(function (err, res) {
                    expect(err).to.not.be.ok;
                    expect(app.db.getServers(function(err, servers) {
                        expect(err).to.not.be.ok;
                        expect(servers).to.have.length(0);
                        expect(app.sshPools).to.not.have.ownProperty(server._id);
                        done();
                    }));
                });
        });

        it("Valid", function (done) {
            done(); // Check beforeeach succeeds
        });

    });

    describe('GET /server/:id/stats', function() {

        function jsonRequest(url) {
            return request(app)
                .get(url.format(server._id))
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
        }

        function successfulJsonRequest(url) {
            return jsonRequest(url)
                .expect(200)

        }

        describe("/swap", function () {

            var swapUrl = '/server/{0}/stats/swap';

            it("should respond with json", function (done) {
                jsonRequest(swapUrl)
                    .expect(200, done);
            });

            it("should return float in data", function (done) {
                successfulJsonRequest(swapUrl)
                    .end(function (err, res) {
                        if (err) return done(err);
                        expect(res.body.data).to.match(REGEX_FLOAT);
                        done()
                    });
            });

        });

        describe("/percUsed", function () {

            var percUsedUrl = '/server/{0}/stats/percUsed?path=/home/ubuntu';

            describe("valid requests", function () {


                it("should respond with json", function (done) {
                    jsonRequest(percUsedUrl)
                        .expect(200, done)
                });

                it("should return float in data", function (done) {
                    successfulJsonRequest(percUsedUrl)
                        .end(function (err, res) {
                            if (err) return done(err);
                            expect(res.body.data).to.match(REGEX_FLOAT);
                            done()
                        });
                });
            });

            describe("invalid requests", function () {
                it("no path parameter", function (done) {
                    jsonRequest('/server/{0}/stats/percUsed')
                        .expect(400, done);
                });
            });

        });

        describe("/percFree", function () {

            var percFreeUrl = '/server/{0}/stats/percFree?path=/home/ubuntu';

            it("should respond with json", function (done) {
                successfulJsonRequest(percFreeUrl)
                    .expect(200, done)

            });

            it("should return float in data", function (done) {
                //noinspection FunctionWithInconsistentReturnsJS
                successfulJsonRequest(percFreeUrl)
                    .end(function (err, res) {
                        if (err) return done(err);
                        expect(res.body.data).to.match(REGEX_FLOAT);
                        done()
                    });
            });

            describe("invalid requests", function () {
                it("no path parameter", function (done) {
                    jsonRequest('/server/{0}/stats/percFree')
                        .expect(400, done);
                });
            });

        });

        describe("/cpu", function () {

            const cpuUrl = '/server/{0}/stats/cpu';

            it("should respond with json", function (done) {
                jsonRequest(cpuUrl)
                    .expect(200, done);
            });

            it("should return float in data", function (done) {
                successfulJsonRequest(cpuUrl)
                    .end(function (err, res) {
                        if (err) return done(err);
                        expect(res.body.data[1]).to.match(REGEX_FLOAT_OR_INT);
                        expect(res.body.data[5]).to.match(REGEX_FLOAT_OR_INT);
                        expect(res.body.data[15]).to.match(REGEX_FLOAT_OR_INT);
                        done()
                    });
            });

        });

    });

});


