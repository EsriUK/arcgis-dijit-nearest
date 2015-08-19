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
 * Execute the Query Task to a Layer
 */
define(["dojo/Deferred", "esri/layers/FeatureLayer", "esri/renderers/jsonUtils", "esri/tasks/query", "esri/tasks/QueryTask", "esri/geometry/Circle", "esri/units"],
    function (Deferred, FeatureLayer, jsonUtils, Query, QueryTask, Circle, Units) {
    var taskOutput = function LayerInfoTask(props) {
        this.properties = props;

        this.getLayerInfo = function () {
            var _this = this, result = new Deferred(), featureLayer;

            // Need to also get the symbology for each layer
            featureLayer = new FeatureLayer(_this.properties.serviceUrl);

            featureLayer.on("error", function (err) {
                result.resolve({ id: _this.properties.layerId, layerInfo: null, results:null, error: err, itemId: _this.properties.itemId });
            });
            featureLayer.on("load", function (data) {
                var layerInf = { renderer: null, id: _this.properties.layerId, itemId: _this.properties.itemId, opacity: _this.properties.layerOpacity };

                if (props.layerRenderer !== undefined && props.layerRenderer !== null) {
                    layerInf.renderer = jsonUtils.fromJson(props.layerRenderer);
                }
                else {
                    layerInf.renderer = data.layer.renderer;
                }

                _this.queryLayer(data.layer.maxRecordCount).then(function (res) {
                    result.resolve({ id: _this.properties.layerId, layerInfo: layerInf, results: res.results, error: null, itemId: _this.properties.itemId, url: _this.properties.serviceUrl });
                });
            });

            return result.promise;
        };

        this.getUnits = function (distanceUnits) {
            switch (distanceUnits) {
                case "m":
                    return Units.MILES;

                case "km":
                    return Units.KILOMETERS

                case "me":
                    return Units.METERS

                default:
                    return Units.MILES;
            }
        };

        this.queryLayer = function (maxRecords) {
            var _this = this, result = new Deferred(), query, queryTask;

            // Use the current location and buffer the point to create a search radius
            query = new Query();
            queryTask = new QueryTask(_this.properties.serviceUrl);

            query.where = "1=1"; // Get everything 
            query.geometry = new Circle({
                center: [_this.properties.currentPoint.x, _this.properties.currentPoint.y],
                geodesic: true,
                radius: _this.properties.searchRadius,
                radiusUnit: _this.getUnits(_this.properties.distanceUnits) 
            });
            query.outFields = ["*"];
            query.returnGeometry = true;
            query.outSpatialReference = _this.properties.currentPoint.spatialReference;
            query.num = maxRecords || 1000;
           // query.spatialRelationship = Query.SPATIAL_REL_CONTAINS;

            queryTask.execute(query, function (features) {
                result.resolve({ error: null, id: _this.properties.layerId, results: features, itemId: _this.properties.itemId});
            },
            function (error) {
                result.resolve({ error: error, id: _this.properties.layerId, results: null, itemId: _this.properties.itemId });
            });

            return result.promise;
        };

        this.execute = function () {
            return this.getLayerInfo();
        };
    };

    return taskOutput;
});