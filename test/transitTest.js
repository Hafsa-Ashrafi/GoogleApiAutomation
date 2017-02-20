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
var mode = "transit";
var seconds = Math.round(new Date().getTime() / 1000);
var arrival_time = seconds + (2 * 3600); //Current Time + 2 hours
var invalidArrivalTime = 1391374800;

//Request Example
//https://maps.googleapis.com/maps/api/directions/
//json?origin=75+9th+Ave+New+York,+NY&destination=MetLife+Stadium+1+MetLife+Stadium+Dr+East+Rutherford,+NJ+07073&mode=transit&arrival_time=1391374800&key=YOUR_API_KEY

var server = supertest.agent(constants.BASEURL);
var jsonRequest = "json?origin=" + encodedOrigin + "&destination=" + encodedDestination + "&mode=" + mode + "&arrival_time=" + arrival_time + "&key=" + apiKey;
var invalidArrivalTimeReq = "json?origin=" + encodedOrigin + "&destination=" + encodedDestination + "&mode=" + mode + "&arrival_time=" + invalidArrivalTime + "&key=" + apiKey;
var invalidDepartureTimeReq = "json?origin=" + encodedOrigin + "&destination=" + encodedDestination + "&mode=" + mode + "&departure_time=" + 222.888 + "&key=" + apiKey;
var requestBicyclingMode = "json?origin=" + encodedOrigin + "&destination=" + encodedDestination + "&mode=" + constants.BICYCLING + "&arrival_time=" + arrival_time + "&key=" + apiKey;

//Test Suite Transit
describe('Testing Directions API - transit from Origin to Destination with different modes eg:bicycling ', function() {

    var validResponse = function(res) {
        res.body.should.have.property("geocoded_waypoints");
        res.body.should.have.property("routes");
        res.body.should.have.property("status");
    };

    //Test Case 1
    it('should return available waypoints and routes for mode type transit and arrival time', function(done) {

        server.get(jsonRequest)
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
    it('should return available waypoints and routes for mode type Bicycling', function(done) {

        server.get(requestBicyclingMode)
            .expect(200)
            .expect("Content-Type", /json/)
            .expect(validResponse)
            .end(function(err, res) {
                if (err) {
                    throw err;
                    done();
                }
                assert.equal(res.body.status, 'OK');

                //Navigate to Routes and get the start/ end address and travel mode
                var routes = res.body.routes;
                for (var i in routes) {
                    var legs = routes[i].legs;
                    for (var j in legs) {
                        var startAddressResult = legs[i].start_address;
                        var endAddressResult = legs[i].end_address;
                        var steps = legs[j].steps;
                        for (var k in steps) {
                            var travel_mode = steps[k].travel_mode;
                        }

                    }
                }
                assert.equal(startAddressResult, (constants.ORIGIN), 'the startAddress result in routes is equal to origin');
                assert.equal(endAddressResult, (constants.DESTINATION), 'the endAddress result in routes is equal to destination');
                assert.equal(travel_mode, 'BICYCLING', 'the travel mode should be bicycling');
                done();
            });

    });

    //Test Case 3
    it('should return no routes if destination cant be reached on given arrival time', function(done) {

        server.get(invalidArrivalTimeReq)
            .expect(200)
            .expect("Content-Type", /json/)
            //.expect(validResponse)
            .end(function(err, res) {
                if (err) {
                    throw err;
                    done();
                }
                assert.equal(res.body.status, 'ZERO_RESULTS');

                //Navigate to Routes and get the start and end address
                var routes = res.body.routes;
                assert.equal(routes, '', 'no routes available');
                done();
            });
    });

    //Test Case 4
    it('should return an error if invalid Departure Time is provided', function(done) {

        server.get(invalidDepartureTimeReq)
            .expect(400)
            .expect("Content-Type", /json/)
            .end(function(err, res) {
                if (err) {
                    throw err;
                    done();
                }
                assert.equal(res.body.status, 'INVALID_REQUEST');
                assert.equal(res.body.error_message, constants.INVALID_DEPT_TIME_ERR);
                var routes = res.body.routes;
                assert.equal(routes, '', 'no routes available');
                done();
            });
    });
});