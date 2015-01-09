
var widgetOptions = {
    maxFeatures: 5,
    mode: "geodesic"
}

describe("A set of tests to test the FindNearest task", function () {
    var _NearestTask, task, Point, featureset = null,
        loadWidget = function (done) {
            require(["dojo/json", "app/tasks/FindNearestTask", "esri/geometry/Point", "dojo/text!app/tests/featureSet.txt"], function (JSON, _nearestTask, _Point, featureSet) {
            task = new _nearestTask(widgetOptions);

            _NearestTask = _nearestTask;
            Point = _Point;
            featureset = JSON.parse(featureSet);
            done();
        });
    },
    createTask = function (opts) {
        if (task) {
            delete task;
            task = null;
        }

        task = new _NearestTask(opts);
    };


    beforeEach(function (done) {
        loadWidget(done);
    });

    afterEach(function () {
        if (task) {
            delete task;
            task = null;
        }
    });

    it("should not be null", function (done) {
        expect(task).not.toEqual(null);
        done();
    });

    it("should set the properties when passed in via the constructor", function (done) {
        expect(task._maxFeature).toEqual(widgetOptions.maxFeatures);
        expect(task._mode).toEqual(widgetOptions.mode);
        done();
    });

    it("should use default settings when not passed in via the constructor", function (done) {
        createTask({});

        expect(task._maxFeature).toEqual(10);
        expect(task._mode).toEqual("planar");
        done();
    });

    it("should convert degrees to radians", function (done) {
        var degreeInRads = Math.PI / 180, correctValue = 0,
            convertedValue = task._degToRad(1);

        expect(convertedValue).toEqual(degreeInRads);
     
        convertedValue = task._degToRad(158);
        correctValue = 158 * degreeInRads;

        expect(convertedValue).toEqual(correctValue);

        expect(task._toRad(1)).toEqual(degreeInRads);

        done();
    });

    it("should convert a distance to miles", function (done) {
        var distanceInMiles = 100, distanceInKM = 1258,
            convertedDistance = task._convertDistanceTo("m", distanceInKM);

        expect(convertedDistance).toEqual(distanceInKM * 0.621371);
        done();
    });

    it("should convert return the original distance", function (done) {
        expect(task._convertDistanceTo("z", 1111)).toEqual(1111);
        done();
    });

    it("should compare two distances", function (done) {
        var a = { distance: 100 }, b = { distance: 200 };

        expect(task._comparator(a, b)).toEqual(-1);

        a.distance = 300;
        expect(task._comparator(a, b)).toEqual(1);

        a.distance = 200;
        expect(task._comparator(a, b)).toEqual(0);
        done();
    });

    it("should return the distance between two points in km", function (done) {
        var a = { x: -0.808796, y: 51.812938 }, b = { x: -0.807825, y: 51.812187 },
            distance = 0.11;

        expect(Math.round(task._greatCircleDistance(a, b) * 100) / 100).toEqual(distance);
        done();
    });

    it("should return the distance between two points using the esri utils", function (done) {
        var a = new Point({ "x": "-0.808796", "y": "51.812938", "spatialReference": { "wkid": "4326" } }), b = new Point({ "x": "-0.807825", "y": "51.812187", "spatialReference": { "wkid": "4326" } }),
            calculatedDistance = task._euclidianDistance(a, b);

        expect(calculatedDistance).toBeGreaterThan(0);
        done();
    });

    it("should return the first n features based on distance", function (done) {
        var features = [
            { distance: 100 },
            { distance: 56.7 },
            { distance: 4 },
            { distance: 7689 },
            { distance: 334 },
            { distance: 45 },
            { distance: 1 },
            { distance: 999.43 },
        ], results = []

        createTask({ maxFeatures: 5, mode: "geodesic" });

        results = task._getMin(features);

        // Should only return the top 5
        expect(results.length).toEqual(5);

        expect(results[0].distance).toEqual(1);
        expect(results[4].distance).toEqual(100);

        done();
    });

    it("should return the first n features based on distance from a featureset", function (done) {
        var a = new Point({ "x": "-0.8055515", "y": "51.8003171", "spatialReference": { "wkid": "4326" } }),
            results = null;
        
        createTask({ maxFeatures: 5, mode: "geodesic" });

        results = task._getNearestResult(a, featureset);

        expect(results.length).toBeGreaterThan(0);
        expect(results.length).toEqual(5);
        expect(results[2].distance).toEqual(33.12278529252344);

        done();
    });

});