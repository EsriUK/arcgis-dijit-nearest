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
    var taskOutput = function ClientNearestTask(props) {
        this.properties = props;

        this.findNearest = function (point, featureSet, layerInfo) {
            var _this = this, result = new Deferred();

            require(["./FindNearestTask"],
            function (FindNearestTask) {
                var task = new FindNearestTask({ maxFeatures: _this.properties.maxResults, mode: _this.properties.mode, distanceUnits: _this.properties.distanceUnits }), params = {
                    point: point,
                    featureSet: featureSet
                };

                task.execute(params).then(function (results) {
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
            return this.findNearest(point, featureSet, layerInfo);
        };
    };

    return taskOutput;
});