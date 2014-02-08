/**
 * Created by mtford on 08/02/2014.
 */
/*global describe, it, before, beforeEach, after, afterEach */

var request = require('supertest');
var app = require("../../../app");
var Utils = require("../../../lib/utils");
var Logger = require('../../../config').logger;

var jsonRequest;

describe('GET /stats', function() {

    function checkReturnsFloatInData(done) {
        jsonRequest.expect(200)
            .expect(function (res) {
                var response = res.body;
                Logger.info('Received', response);
                if (!('data' in  response)) return "missing data key";
                var data = response['data'];
                if (!Utils.isFloat(data)) return "swap is of incorrect data type " + typeof(data);
            })
            .end(function (err, res) {
                if (err) return done(err);
                done()
            });
    }

    function checkReturnsJson(done) {
        jsonRequest.expect(200, done);
    }

    describe("/swap", function () {

        beforeEach(function (){
            jsonRequest = request(app).get('/stats/swap').set('Accept', 'application/json');
        });

        it("should respond with json", function (done) {
            checkReturnsJson(done);
        });

        it("should return float in data", function (done) {
            //noinspection FunctionWithInconsistentReturnsJS
            checkReturnsFloatInData(done);
        });

    });

    describe("/percUsed", function () {

        describe("valid requests", function () {

            beforeEach(function (){
                jsonRequest = request(app).get('/stats/percUsed?path=/home/ubuntu').set('Accept', 'application/json');
            });

            it("should respond with json", function (done) {
                checkReturnsJson(done);
            });

            it("should return float in data", function (done) {
                //noinspection FunctionWithInconsistentReturnsJS
                checkReturnsFloatInData(done);
            });
        });

        describe("invalid requests", function () {

            it("no path parameter", function (done) {
                request(app).get('/stats/percUsed').set('Accept', 'application/json')
                .expect(400, done);
            });

        });



    });

    describe("/percFree", function () {

        beforeEach(function (){
            jsonRequest = request(app).get('/stats/percUsed?path=/home/ubuntu').set('Accept', 'application/json');
        });

        it("should respond with json", function (done) {
            checkReturnsJson(done);
        });

        it("should return float in data", function (done) {
            //noinspection FunctionWithInconsistentReturnsJS
            checkReturnsFloatInData(done);
        });

    });

    describe("/cpu", function () {

        beforeEach(function (){
            jsonRequest = request(app).get('/stats/cpu').set('Accept', 'application/json');
        });

        it("should respond with json", function (done) {
            jsonRequest.expect(200, done);
        });

        it("should return float in data", function (done) {
            jsonRequest.expect(200)
                .expect(function (res) {
                    var response = res.body;
                    Logger.info('Received', response);
                    if (!('data' in  response)) return "missing data key";
                    var data = response['data'];
                    if (!(1 in data)) return "missing 1 minute average";
                    if (!(5 in data)) return "missing 5 minute average";
                    if (!(15 in data)) return "missing 15 minute average";
                    if (!Utils.isFloat(data[1])) return "1 minute average is of incorrect data type " + typeof(data);
                    if (!Utils.isFloat(data[5])) return "5 minute average is of incorrect data type " + typeof(data);
                    if (!Utils.isFloat(data[15])) return "15 minute is of incorrect data type " + typeof(data);
                })
                .end(function (err, res) {
                    if (err) return done(err);
                    done()
                });
        });

    });

});




