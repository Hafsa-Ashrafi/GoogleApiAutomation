var should = require('should');
var expect = require('chai');
var supertest = require('supertest');
var util = require('util');
var assert = require('assert');
var constants = require('./constants');
var utils = require('./directionsUtils');

var encodedOrigin = (constants.ORIGIN).replace(/ /g, "+");
var encodedDestination = (constants.DESTINATION).replace(/ /g, "+");
var apiKey = constants.API_KEY;

//Request Example
//https://maps.googleapis.com/maps/api/directions/
//json?origin=75+9th+Ave+New+York,+NY&destination=MetLife+Stadium+1+MetLife+Stadium+Dr+East+Rutherford,+NJ+07073&key=YOUR_API_KEY
var server = supertest.agent(constants.BASEURL);
var validJsonRequest = "json?origin=" + encodedOrigin + "&destination=" + encodedDestination + "&key=" + apiKey;
var invalidKeyJsonRequest = "json?origin=" + encodedOrigin + "&destination=" + encodedDestination + "&key=InvalidApiKey";
var noOriginRequest = "json?destination=" + encodedDestination + "&key=" + apiKey;
var noDestinationRequest = "json?origin=" + encodedOrigin + "&key=" + apiKey;

//Test Suite Driving
describe('Testing Directions API - driving directions from Origin to Destination ', function() {

    var validResponse = function(res) {
        res.body.should.have.property("geocoded_waypoints");
        res.body.should.have.property("routes");
        res.body.should.have.property("status");
    };

    //Test Case 1
    it('should return available waypoints and routes', function(done) {

        server.get(validJsonRequest)
            .expect(200)
            .expect("Content-Type", /json/)
            .expect(validResponse)
            .end(function(err, res) {
                if (err) {
                    throw err;
                    done();
                }
                assert.equal(res.body.status, 'OK');

                //Navigate to Routes and get the start and end address
                var result = utils.directionUtils.startToEndAddress(res.body);
                startAddressResult = result.startAddressResult;
                endAddressResult = result.endAddressResult;

                //Check that routes contain the origin and destination
                assert.equal(startAddressResult, (constants.ORIGIN), 'the startAddress result in routes is equal to origin');
                assert.equal(endAddressResult, (constants.DESTINATION), 'the endAddress result in routes is equal to destination');
                done();
            });
    });

    //Test Case 2
    it('should return an error if API key is invalid', function(done) {

        server.get(invalidKeyJsonRequest)
            .expect(200)
            .expect("Content-Type", /json/)
            //.expect(validResponse)
            .end(function(err, res) {
                if (err) {
                    throw err;
                    done();
                }
                assert.equal(res.body.status, 'REQUEST_DENIED');
                assert.equal(res.body.error_message, constants.INVALID_API_KEY_ERR);

                var routes = res.body.routes;
                assert.equal(routes, '', 'no routes available');
                done();
            });
    });

    //Test Case 3
    it('should return an error if origin is not provided', function(done) {

        server.get(noOriginRequest)
            .expect(400)
            .expect("Content-Type", /json/)
            //.expect(validResponse)
            .end(function(err, res) {
                if (err) {
                    throw err;
                    done();
                }
                assert.equal(res.body.status, 'INVALID_REQUEST');
                assert.equal(res.body.error_message, constants.ORIGIN_MISSING_ERR);

                //Navigate to Routes and get the start and end address
                var routes = res.body.routes;
                assert.equal(routes, '', 'no routes available');
                done();
            });
    });

    //Test Case 4
    it('should return an error if destination is not provided', function(done) {

        server.get(noDestinationRequest)
            .expect(400)
            .expect("Content-Type", /json/)
            //.expect(validResponse)
            .end(function(err, res) {
                if (err) {
                    throw err;
                    done();
                }
                assert.equal(res.body.status, 'INVALID_REQUEST');
                assert.equal(res.body.error_message, constants.DESTINATION_MISSING_ERR);

                //Navigate to Routes and get the start and end address
                var routes = res.body.routes;
                assert.equal(routes, '', 'no routes available');
                done();
            });
    });
});