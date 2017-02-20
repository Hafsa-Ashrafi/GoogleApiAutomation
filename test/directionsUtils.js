exports.directionUtils = {

    // Retrieving start and end address of all routes and waypoints
    startToEndAddress: function(resposeBody) {
        var endAddressResult = [];
        var startAddressResult = [];
        var legs = this.getLegsFromRoutes(resposeBody);
        for (var j in legs) {
            endAddressResult[j] = legs[j].end_address;
            startAddressResult[j] = legs[j].start_address;
        }
        return {
            startAddressResult: startAddressResult,
            endAddressResult: endAddressResult
        };
    },

    //Retrieving Distance and time of all routes
    getTotalTimeAndDistance: function(resposeBody) {
        var legs = this.getLegsFromRoutes(resposeBody);
        for (var j in legs) {
            var distance = legs[j].distance.text;
            var time = legs[j].duration.text;
            break;
        }
        return {
            distance: distance,
            time: time
        };
    },

    //Retrieve legs from Routes
    getLegsFromRoutes: function(resposeBody) {
        var routes = resposeBody.routes;
        for (var i in routes) {
            var legs = routes[i].legs;
            break;
        }
        return legs;
    },

    //Get The order in Which the waypoints will be allocated on the map
    getWaypointsOrder: function(resposeBody) {
        var routes = resposeBody.routes;
        for (var i in routes) {
            var waypointsOrder = routes[i].waypoint_order;
            break;
        }
        return waypointsOrder;
    },

    //Rearrange Waypoints according to the waypoints_order
    rearrangeWayPointOrder: function(waypointsOrder, waypointsArray, origin, destination) {
        var finalArray = [];
        finalArray[0] = origin;
        finalArray[(waypointsOrder.length) + 1] = destination
        for (var i = 0; i < 2; i++) {
            var order = waypointsOrder[i];
            finalArray[i + 1] = waypointsArray[order];
        }
        return finalArray;
    }
}