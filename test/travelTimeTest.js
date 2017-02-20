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
var departure_time = Math.round(new Date().getTime() / 1000);
var traffic_model = "best_guess";

//Request Example
//https://maps.googleapis.com/maps/api/directions/
//json?origin=75+9th+Ave+New+York,+NY&destination=MetLife+Stadium+1+MetLife+Stadium+Dr+East+Rutherford,+NJ+07073&departure_time=1541202457&traffic_model=best_guess&key=AIzaSyDHJRlrMKlzlndqkNjBRv4MDacLS99mYcY
var server = supertest.agent(constants.BASEURL);
var validJsonRequest = "json?origin=" + encodedOrigin + "&destination=" + encodedDestination + "&departure_time=" + departure_time + "&traffic_model=" + traffic_model + "&key=" + apiKey;
var noDeptTimeWithTraficModel = "json?origin=" + encodedOrigin + "&destination=" + encodedDestination + "&traffic_model=" + traffic_model + "&key=" + apiKey;

//Test Suite Travel time
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

                var travelTimeResult = utils.directionUtils.getTotalTimeAndDistance(res.body);

                assert.ok(travelTimeResult.time, 'the Travel Time is provided ' + travelTimeResult.time);
                assert.ok(travelTimeResult.distance, 'the Distance is provided ' + travelTimeResult.distance);
                done();
            });

    });

    //Test Case 2
    it('should return an error if trafic model is provided and Departure Tiime is not provided', function(done) {

        server.get(noDeptTimeWithTraficModel)
            .expect(400)
            .expect("Content-Type", /json/)
            .end(function(err, res) {
                if (err) {
                    throw err;
                    done();
                }
                assert.equal(res.body.status, 'INVALID_REQUEST');
                assert.equal(res.body.error_message, constants.DEPT_TIME_MISSING_ERR);
                var routes = res.body.routes;
                assert.equal(routes, '', 'no routes available');
                done();
            });
    });
});