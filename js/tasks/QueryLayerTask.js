/*global pulse, app, jQuery, require, document, esri, esriuk, Handlebars, console, $, mynearest, window, alert, unescape, define */


/**
 * Execute the Query Task to a Layer
 */
define(["dojo/Deferred"], function (Deferred) {
    var taskOutput = function QueryLayerTask(props) {
        this.properties = props;

        this.queryLayer = function () {
            var _this = this, result = new Deferred();

            require(["esri/tasks/query", "esri/tasks/QueryTask", "esri/geometry/Circle", "esri/units", "esri/request"],
                function (Query, QueryTask, Circle, Units, esriRequest) {
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

                    esriRequest.setRequestPreCallback(function (args) {
                        if (args.url.indexOf(_this.properties.serviceUrl) > -1) {
                            //console.log("Found url, adding token");
                            
                            if (esri.id.credentials && esri.id.credentials.length > 0) {
                                args.url += "?token=" + esri.id.credentials[0].token;
                            }
                        }
                        return args;
                    });

                    queryTask.execute(query, function (features) {
                        result.resolve({ error: null, id: _this.properties.layerId, results: features });
                    },
                    function (error) {
                        result.resolve({ error: error, id: _this.properties.layerId, results: null });
                    });
                });


            return result.promise;
        };


        this.execute = function () {
            return this.queryLayer();
        };
    };

    return taskOutput;
});