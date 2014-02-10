/**
 * Created by mtford on 08/02/2014.
 */
/*global describe, it, before, beforeEach, after, afterEach */

var request = require('supertest');
var app = require("../../../../app");
var Utils = require("../../../../lib/utils");
var Logger = require('../../../../config').logger;
var should = require('should');

const REGEX_FLOAT = /^[0-9]*[.][0-9]+$/;

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
                res.body.data.should.match(REGEX_FLOAT);
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
                        res.body.data.should.match(REGEX_FLOAT);
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
                    res.body.data.should.match(REGEX_FLOAT);
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
                    res.body.data[1].should.match(REGEX_FLOAT);
                    res.body.data[5].should.match(REGEX_FLOAT);
                    res.body.data[15].should.match(REGEX_FLOAT);
                    done()
                });
        });

    });

});