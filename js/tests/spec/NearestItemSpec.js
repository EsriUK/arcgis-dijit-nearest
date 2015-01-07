


var featureProps = {
    feature: {
        feature: {
            attributes: {
                FID: 1,
                LineName: "Victoria",
                SHAPE_Leng: 34698.8106044
            }
        }
    },
    layerItemId: "asdr34ff4ff4",
    distanceUnits: "miles",
    distance: 1.34,
    featureNumber: 12,
    showOnMap: true,
    showOnMapLinktext: "Show on map",
    description: "hello there",
    fieldValues: null,
    titleText: "The title",
    titleField: ["LineName"],
    renderer: { a: "im a renderer" }
};


describe("A set of tests to test the Nearest Item widget", function () {
    var NearestItem, widget, loadWidget = function (done) {
        require(["app/NearestItem"], function (nearestItem) {
            widget = new nearestItem(featureProps, 'widgetItem');
            NearestItem = nearestItem;

            widget.startup();
            done();
        });
    },
    createWidget = function (props) {
        if (widget) {
            widget.destroy();
            widget = null;
        }

        widget = new NearestItem(props, 'widgetItem');
        widget.startup();
    };


    beforeEach(function (done) {
        loadWidget(done);
    });

    afterEach(function () {
        if (widget) {
            widget.destroy();
            widget = null;
        }
    }); 

    it("should not be null", function (done) {
        expect(widget).not.toEqual(null);
        done();
    });



    it("should set the properties when passed in via the constructor", function (done) {
        createWidget(featureProps);

        expect(widget.feature).toEqual(featureProps.feature);
        expect(widget.distance).toEqual(featureProps.distance);
        expect(widget.layerItemId).toEqual(featureProps.layerItemId);
        expect(widget.distanceUnits).toEqual(featureProps.distanceUnits);
        expect(widget.distance).toEqual(featureProps.distance);
        expect(widget.showOnMap).toEqual(featureProps.showOnMap);
        expect(widget.showOnMapLinktext).toEqual(featureProps.showOnMapLinktext);
        expect(widget.description).toEqual(featureProps.description);
        expect(widget.featureNumber).toEqual(featureProps.featureNumber);
        expect(widget.fieldValues).toEqual(featureProps.fieldValues);
        expect(widget.titleField).toEqual(featureProps.titleField);
        expect(widget.titleText).toEqual(featureProps.titleText);
        expect(widget.renderer).toEqual(featureProps.renderer);

        done();
    });

    it("should show the map link", function (done) {
        expect(widget.showOnMapVisible).toEqual("block");
        done();
    });


    it("should show the counters", function (done) {
        var props = featureProps;
        props.showCounters = true;

        createWidget(props);

        expect(widget.showCountersVisible).toEqual("block");
        done();
    });

    it("should set the featureId", function (done) {
        var props = featureProps;
        props.showCounters = true;

        createWidget(props);

        expect(widget.featureId).toEqual(props.feature.feature.attributes[props.titleField[0]] + "-" + props.featureNumber + "-" + props.layerItemId);
        done();
    });

});