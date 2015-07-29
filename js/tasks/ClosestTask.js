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

/**
 * Find Nearest Task
 */
define(["dojo/Deferred", "require"], function (Deferred, require) {
    var taskOutput = function ClosestTask(props) {
        this.properties = props;

        this.findClosestTask = function (point, featureSet, layerInfo) {
            var _this = this, result = new Deferred();

            require(["esri/tasks/ClosestFacilityTask", "esri/tasks/ClosestFacilityParameters", "esri/tasks/FeatureSet", "esri/graphic"],
            function (ClosestFacilityTask, ClosestFacilityParameters, FeatureSet, Graphic) {
                var params = new ClosestFacilityParameters(), incidents = new FeatureSet();

                var features = [new Graphic(point)];

                incidents.features = features;

                params.defaultTargetFacilityCount = _this.properties.maxResults;
                params.facilities = featureSet;
                params.returnIncidents = false;
                params.returnRoutes = false;
                params.returnDirections = false;
                params.incidents = incidents;

                var closestTask = new ClosestFacilityTask(_this.properties.url);

                closestTask.solve(params).then(function (results) {
                    result.resolve({ id: _this.properties.layerId, result: results, layerInfo: layerInfo, error: null, itemId: _this.properties.itemId, limitExceeded: featureSet.exceededTransferLimit });
                }, function (err) {
                    result.resolve({ id: _this.properties.layerId, result: null, layerInfo: null, error: err, itemId: _this.properties.itemId });
                }).otherwise(function (err) {
                    //console.error(err.message);
                    result.resolve({ id: _this.properties.layerId, result: null, layerInfo: null, error: err, itemId: _this.properties.itemId });
                });
            });

            return result.promise;
        };


        this.execute = function (point, featureSet, layerInfo) {
            return this.findClosestTask(point, featureSet, layerInfo);
        };
    };

    return taskOutput;
});