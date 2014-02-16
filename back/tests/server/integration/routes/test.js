/**
 * Created by mtford on 08/02/2014.
 */
/*global describe, it, before, beforeEach, after, afterEach */

var request = require('supertest');
var app = require("../../../../app");
var expect = require('expect.js');

const REGEX_FLOAT = /^[0-9]*[.][0-9]+$/;
const REGEX_FLOAT_OR_INT = /^[0-9]*([.][0-9]+)?$/;


describe('GET /stats', function() {

    function jsonRequest(url) {
        return request(app)
            .get(url)
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
    }

    function successfulJsonRequest(url) {
        return jsonRequest(url)
            .expect(200)
    }

    describe("/swap", function () {

        var swapUrl = '/stats/swap';

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

        describe("valid requests", function () {

            const percUsedUrl = '/stats/percUsed?path=/home/ubuntu';

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
                jsonRequest('/stats/percUsed')
                    .expect(400, done);
            });
        });

    });

    describe("/percFree", function () {

        var percFreeUrl = '/stats/percFree?path=/home/ubuntu';

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
                jsonRequest('/stats/percFree')
                    .expect(400, done);
            });
        });

    });

    describe("/cpu", function () {

        const cpuUrl = '/stats/cpu';

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