var should = require('should');
var expect = require('chai');
var supertest = require('supertest');
var util = require('util');
var assert = require('assert');
var constants = require('./constants.js');
var utils = require('./directionsUtils');
var apiKey = constants.API_KEY;

var origin = "New York, NY, USA";
var destination = "Boston, MA, USA";
var encodedOrigin = origin.replace(/ /g, "+");
var encodedDestination = destination.replace(/ /g, "+");

var waypoint1 = "Providence, RI, USA";
var waypoint2 = "Hartford, CT, USA";
var waypointsArray = [waypoint1, waypoint2];
var waypoints = "optimize:true|" + waypoint1 + "|" + waypoint2;

var mode = "driving";

//Request Example
//https://maps.googleapis.com/maps/api/directions/
//json?origin=75+9th+Ave+New+York,+NY&destination=MetLife+Stadium+1+MetLife+Stadium+Dr+East+Rutherford,+NJ+07073&key=YOUR_API_KEY
var server = supertest.agent(constants.BASEURL);
var validJsonRequest = "json?origin=" + encodedOrigin + "&destination=" + encodedDestination + "&waypoints=" + waypoints + "&key=" + apiKey;
var invalidOriginJsonReq = "json?origin=INVALID" + "&destination=" + encodedDestination + "&waypoints=" + waypoints + "&key=" + apiKey;
var invalidWaypointRequest = "json?origin=" + encodedOrigin + "&destination=" + encodedDestination + "&mode=" + mode + "&waypoints=Invalidwaypoints&key=" + apiKey;
var singleWaypointTransitModeReq = "json?origin=" + encodedOrigin + "&destination=" + encodedDestination + "&mode=transit" + "&waypoints=" + waypoint1 + "&key=" + apiKey;

//Test Suite Waypoints
describe('Testing Directions API - driving directions from Origin to Destination ', function() {

    var validResponse = function(res) {
        res.body.should.have.property("geocoded_waypoints");
        res.body.should.have.property("routes");
        res.body.should.have.property("status");
    };

    //Test Case 1
    it('should return available waypoints, order and routes', function(done) {

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

                var waypointsOrder = utils.directionUtils.getWaypointsOrder(res.body);
                assert.equal(waypointsOrder.length, waypointsArray.length);

                var rearrangedWaypoints = utils.directionUtils.rearrangeWayPointOrder(waypointsOrder, waypointsArray, origin, destination);

                var result = utils.directionUtils.startToEndAddress(res.body);
                startAddressResult = result.startAddressResult;
                endAddressResult = result.endAddressResult;

                for (var i = 0; i < 3; i++) {
                    //Check that routes contain the origin  waypoints and  destination
                    assert.equal(startAddressResult[i], rearrangedWaypoints[i], 'the startAddress result in route' + i);
                    assert.equal(endAddressResult[i], rearrangedWaypoints[i + 1], 'the endAddress result in route' + i);
                }
                done();
            });
    });

    //Test Case 2
    it('should return not found if geolocation of origin cannot be located', function(done) {

        server.get(invalidOriginJsonReq)
            .expect(200)
            .expect("Content-Type", /json/)
            //.expect(validResponse)
            .end(function(err, res) {
                if (err) {
                    throw err;
                    done();
                }
                assert.equal(res.body.status, 'ZERO_RESULTS');
                var routes = res.body.routes;
                assert.equal(routes, '', 'no routes available');
                done();
            });
    });

    //Test Case 3
    it('should return an error if invalid waypoint is provided', function(done) {

        server.get(invalidWaypointRequest)
            .expect(200)
            .expect("Content-Type", /json/)
            .end(function(err, res) {
                if (err) {
                    throw err;
                    done();
                }
                assert.equal(res.body.status, 'NOT_FOUND');
                var routes = res.body.routes;
                assert.equal(routes, '', 'no routes available');
                done();
            });

    });

    //Test Case 4
    it('should return an error if only one waypoint is provided when mode is transit', function(done) {

        server.get(singleWaypointTransitModeReq)
            .expect(200)
            .expect("Content-Type", /json/)
            .end(function(err, res) {
                if (err) {
                    throw err;
                    done();
                }
                assert.equal(res.body.status, 'INVALID_REQUEST');
                assert.equal(res.body.error_message, constants.WAYPOINTS_ERR);

                var routes = res.body.routes;
                assert.equal(routes, '', 'no routes available');
                done();
            });
    });
});