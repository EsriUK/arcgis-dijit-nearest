/*global pulse, app, jQuery, require, document, esri, esriuk, Handlebars, console, $, mynearest, window, alert, unescape, define */


/**
 * Find Nearest Task
 */
define(["dojo/Deferred"], function (Deferred) {
    var taskOutput = function ClientNearestTask(props) {
        this.properties = props;

        this.findNearest = function (point, featureSet) {
            var _this = this, result = new Deferred();

            require(["app/tasks/FindNearestTask"],
            function (FindNearestTask) {
                var task = new FindNearestTask({ maxFeatures: _this.properties.maxResults, mode: "geodesic" }), params = {
                    point: point,
                    featureSet: featureSet
                };

                task.execute(params).then(function (results) {
                    result.resolve({ id: _this.properties.layerId, result: results, error: null, itemId: _this.properties.itemId });
                }, function (err) {
                    result.resolve({ id: _this.properties.layerId, result: null, error: err, itemId: _this.properties.itemId });
                }).otherwise(function (err) {
                    //console.error(err.message);
                    result.resolve({ id: _this.properties.layerId, result: null, error: err, itemId: _this.properties.itemId });
                });
            });

            return result.promise;
        };


        this.execute = function (point, featureSet) {
            return this.findNearest(point, featureSet);
        };
    };

    return taskOutput;
});