/*global pulse, app, jQuery, require, document, esri, esriuk, Handlebars, console, $, mynearest, window, alert, unescape, define */


/**
 * Execute the Query Task to a Layer
 */
define(["dojo/Deferred", "esri/layers/FeatureLayer"], function (Deferred, FeatureLayer) {
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
                _this.queryLayer().then(function (res) {
                    result.resolve({ id: _this.properties.layerId, layerInfo: data.layer, results: res.results, error: null, itemId: _this.properties.itemId });
                });
            });

            return result.promise;
        };

        this.queryLayer = function () {
            var _this = this, result = new Deferred();

            require(["esri/tasks/query", "esri/tasks/QueryTask", "esri/geometry/Circle", "esri/units"],
                function (Query, QueryTask, Circle, Units) {
                    // Use the current location and buffer the point to create a search radius
                    var query = new Query(), queryTask = new QueryTask(_this.properties.serviceUrl);

                    query.where = "1=1"; // Get everything 
                    query.geometry = new Circle({
                        center: _this.properties.currentPoint,
                        radius: _this.properties.searchRadius,
                        radiusUnit: Units.MILES,
                        geodesic: true
                    });
                    query.outFields = ["*"];
                    query.returnGeometry = true;

                    queryTask.execute(query, function (features) {
                        result.resolve({ error: null, id: _this.properties.layerId, results: features, itemId: _this.properties.itemId });
                    },
                    function (error) {
                        result.resolve({ error: error, id: _this.properties.layerId, results: null, itemId: _this.properties.itemId });
                    });
                });


            return result.promise;
        };

        this.execute = function () {
            return this.getLayerInfo();
        };
    };

    return taskOutput;
});