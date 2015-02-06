/*global pulse, app, jQuery, require, document, esri, esriuk, Handlebars, console, $, mynearest, window, alert, unescape, define */

/*
 | Copyright 2015 ESRI (UK) Limited
 |
 | Licensed under the Apache License, Version 2.0 (the "License");
 | you may not use this file except in compliance with the License.
 | You may obtain a copy of the License at
 |
 |    http://www.apache.org/licenses/LICENSE-2.0
 |
 | Unless required by applicable law or agreed to in writing, software
 | distributed under the License is distributed on an "AS IS" BASIS,
 | WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 | See the License for the specific language governing permissions and
 | limitations under the License.
 */
/* This task uses code from www.movable-type.co.uk                                                */
/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */
/*  Latitude/longitude spherical geodesy formulae & scripts           (c) Chris Veness 2002-2014  */
/*   - www.movable-type.co.uk/scripts/latlong.html                                   MIT Licence  */
/*  https://github.com/chrisveness/geodesy/blob/master/LICENSE                                    */
/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */

define([
	"dojo/_base/declare",
	"dojo/_base/array",
	"dojo/Deferred",
	"esri/geometry/Point",
    "esri/geometry/Polygon",
    "esri/SpatialReference",
	"esri/geometry/mathUtils"],
	function (declare, array, Deferred, Point, Polygon, SpatialReference, mathUtils) {
		"use strict";


		return declare(null, {
		    constructor : function(options) {
			    this._maxFeature = options.maxFeatures || 10;
			    this._mode = options.mode || "planar"; // planar or geodesic
		    },

		    execute : function(params) {
			    var deferred = new Deferred();

			    try {
				    deferred.resolve(this._getNearestResult(params.point, params.featureSet));
			    } catch (err) {
				    deferred.reject(err);
			    }

			    return deferred.promise;
		    },

		    _getNearestResult : function(point, featureSet) {
		        // summary:
		        //		Calculates distances for features arounda point

		        var features = featureSet.features,
				    distance = this._mode === "geodesic" ? this._greatCircleDistance : this._euclidianDistance,
				    candidates = [], geometry, result, _this = this, polyCandidates = [], multiPCandidates = [];

			    // Supported in 10.1 or greater
			    if (featureSet.exceededTransferLimit && featureSet.exceededTransferLimit === true) {
			        console.warn("Feature limit reached, the result may not be accurate.");
			        result = { "limitExceeded": true };
			        return result;
			    }

			    // Calculate distance for each feature
			    if (featureSet.geometryType === "esriGeometryPoint") {
				    array.forEach(features, function(feature) {
					    candidates.push({
						    point: feature.geometry,
						    feature: feature,
						    distance: _this._convertDistanceTo("m", distance.call(_this, point, feature.geometry))
					    });
				    });

				    result = this._getMin(candidates);
			    }
			    else if (featureSet.geometryType === "esriGeometryPolygon") {
			        polyCandidates = [];
				    array.forEach(features, function(feature) {
					    geometry = feature.geometry;
					    array.forEach(geometry.rings, function (ring) {
                            // This returns candidates that have a mathmatical distance from the geometry based on the coordinate system
					        polyCandidates.push(this._getNearest(point, feature, ring));
					    }, this);
				    }, this);

			        // The coordinate based distance must be converted into a standard distance measurement i.e. Km or Miles
				    array.forEach(polyCandidates, function (candidate) {
				        candidate.distance = _this._convertDistanceTo("m", distance.call(_this, point, candidate.point));
				        // Once the final distance has been calculated check if the Point is inside the Polygon
				        var polyToCheck = new Polygon(candidate.feature.geometry);
				        if (polyToCheck.contains(point)) {
				            candidate.distance = 0;
				        }

				        candidates.push(candidate);
				    });


				    result = this._getMin(candidates);
			    }
			    else if (featureSet.geometryType === "esriGeometryPolyline") {
			        polyCandidates = [];
				    array.forEach(features, function(feature) {
					    geometry = feature.geometry;
					    array.forEach(geometry.paths, function(path) {
					        polyCandidates.push(this._getNearest(point, feature, path));
					    }, this);
				    }, this);

			        // The coordinate based distance must be converted into a standard distance measurement i.e. Km or Miles
				    array.forEach(polyCandidates, function (candidate) {
				        candidate.distance = _this._convertDistanceTo("m", distance.call(_this, point, candidate.point));
				        candidates.push(candidate);
				    });

				    result = this._getMin(candidates);
			    }
			    else if (featureSet.geometryType === "esriGeometryMultipoint") {
			        multiPCandidates = [];
			        array.forEach(features, function(feature) {
			            geometry = feature.geometry;

                        // If the geometery is Multipoint but only has a single point in it
			            if (geometry.points.length === 1) {
			                multiPCandidates.push({
			                    point: geometry.points[0],
			                    feature: feature,
			                    distance: _this._convertDistanceTo("m", distance.call(_this, point, new Point(geometry.points[0][0], geometry.points[0][1], new SpatialReference(4326))))
			                });
			            }
			            else {
			                multiPCandidates.push(this._getNearest(point, feature, geometry.points));
			            }
			        }, this);

		            // The coordinate based distance must be converted into a standard distance measurement i.e. Km or Miles
			        array.forEach(multiPCandidates, function (candidate) {
			            if (candidate.feature.geometry.points.length > 1) {
			                candidate.distance = _this._convertDistanceTo("m", distance.call(_this, point, candidate.point));
			            }
			            candidates.push(candidate);
			        });

			        result = this._getMin(candidates);
			    }
			    else {
				    // Not supported
				    result = [];
			    }

			    return result;
		    },

		    _getMin : function(features) {
			    var comparator = this._comparator;

			    // Sort the features
			    features.sort(comparator);

			    // Return the first 'n' features
			    return features.slice(0, this._maxFeature);
		    },
		
		    _getNearest: function (/*esri/geometry/Point*/point, /*esri/geometry/Geometry*/parentFeature, /*Number[]*/path) {
		        // summary:
		        //		Finds the nearest feature around a point

		        var minDistance = null, from, to, x, y, dx, dy, i, a, b, distance, n, len,
				    pathPoints, fromPoint, toPoint, length2, toEnd2, toStart2, distance2, calcLength2;
	
			    function square(num) {
				    // Faster than Math.pow to square a number
				    return num * num;
			    }
	
			    // Convert path to pathPoints
			    pathPoints = array.map(path, function (item) {
				    return { "x": item[0], "y": item[1] };
			    });
			
			    if (pathPoints.length > 1) {
				    for (n = 1, len = pathPoints.length; n < len; n++) {
					    // Get segment from points
					    fromPoint = pathPoints[n - 1];
					    toPoint = pathPoints[n];
	
					    if (toPoint.x !== fromPoint.x) {
						    a = (toPoint.y - fromPoint.y) / (toPoint.x - fromPoint.x);
						    b = toPoint.y - a * toPoint.x;
						    distance = Math.abs(a * point.x + b - point.y) / Math.sqrt(a * a + 1);
					    } else {
						    distance = Math.abs(point.x - toPoint.x);
					    }
	
					    // Length squared of the line segment 
					    length2 = square(toPoint.y - fromPoint.y) + square(toPoint.x - fromPoint.x);
					    // Distance squared of point to the start of the line segment
					    toStart2 = square(fromPoint.y - point.y) + square(fromPoint.x - point.x);
					    // Distance squared of point to end of the line segment
					    toEnd2 = square(toPoint.y - point.y) + square(toPoint.x - point.x);
					    // Minimum distance squared of the point to the infinite line
					    distance2 = square(distance);
					    // Calculated length squared of the line segment
					    calcLength2 = toEnd2 - distance2 + toStart2 - distance2;
	
					    // Redefine minimum distance to line segment (not infinite line) if necessary
					    if (calcLength2 > length2) {
						    distance = Math.sqrt(Math.min(toEnd2, toStart2));
					    }
	
					    if ((minDistance === null) || (minDistance > distance)) {
						    if (calcLength2 > length2) {
							    if (toStart2 < toEnd2) {
								    to = 0; // Nearer to previous point
								    from = 1;
							    } else {
								    from = 0; // Nearer to current point
								    to = 1;
							    }
						    } else {
							    // perpendicular from point intersects line segment
							    to = ((Math.sqrt(toStart2 - distance2)) / Math.sqrt(length2));
							    from = ((Math.sqrt(toEnd2 - distance2)) / Math.sqrt(length2));
						    }
	
						    minDistance = distance;
						    i = n;
					    }
				    }
	
				    // Calculate coordinates
				    dx = pathPoints[i - 1].x - pathPoints[i].x;
				    dy = pathPoints[i - 1].y - pathPoints[i].y;
				    x = pathPoints[i - 1].x - (dx * to);
				    y = pathPoints[i - 1].y - (dy * to);
			    }

			    // Return feature
			    return {
				    point: new Point(x, y, point.spatialReference),
				    feature: parentFeature,
				    distance: minDistance
			    };
		    },

		    _euclidianDistance : function(p1, p2) {
			    return mathUtils.getLength(p1, p2);
		    },

		    _degToRad: function(deg) {
		        // summary:
		        //		Converts degrees to radians
		        return (deg * Math.PI) / 180;
	        },

		    _greatCircleDistance: function (p1, p2) {
		        // summary:
		        //		Returns the distance between two points in Km

			    // Haversine formula (http://www.movable-type.co.uk/scripts/latlong.html)
			    var toRad = this._toRad,
				    radius = 6378.1, // Earth's mean radius in km
				    lat1 = toRad.call(this, p1.y),
				    lon1 = toRad.call(this, p1.x),
				    lat2 = toRad.call(this, p2.y),
				    lon2 = toRad.call(this, p2.x),
				    dLat = lat2 - lat1,
				    dLon = lon2 - lon1,
				    a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) * Math.sin(dLon / 2),
				    c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

			    return radius * c;
			    // Length in km
		    },

		    _toRad: function (number) {
		        // summary:
		        //		Converts a number to radians
		        return this._degToRad(number);
		    },

		    _convertDistanceTo: function (distanceUnits, distance) {
		        // summary:
		        //		Converts a distance from one unit type to another

		        var convertedDistance = null;

		        switch (distanceUnits) {
		            case "m":
		                convertedDistance = distance * 0.621371;
		                break;

		            default:
		                convertedDistance = distance;
		                break;
		        }

		        return convertedDistance;
		    },

		    _comparator: function (a, b) {
		        // summary:
		        //		Compares two numbers
			    if (a.distance < b.distance) {
				    return -1;
			    }

			    if (a.distance > b.distance) {
				    return 1;
			    }

			    return 0;
		    }
	});
});
