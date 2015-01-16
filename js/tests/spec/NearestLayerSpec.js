
var layerProps = {
    results: {
        id: "123456",
        result: [
            { feature: pointFeatureSet.features[0], distance: 1 },
            { feature: pointFeatureSet.features[1], distance: 23 },
            { feature: pointFeatureSet.features[2], distance: 12.096453242 }
        ],
        layerInfo: {
            popupInfo: itemData.operationalLayers[0].popupInfo,
            renderer: itemDetails.renderer
        }
    },
    layerInfo: {
        popupInfo: itemData.operationalLayers[0].popupInfo,
        renderer: itemDetails.renderer
    },
    maxFeatures: 5,
    distance: 0,
    distanceUnits: "miles",
    layerOptions: {
        showOnMap: true,
        showCounters: true,
        display: "expandable"
    }
};


describe("A set of tests for the Nearest Layer widget", function () {
    var NearestLayer, widget, loadWidget = function (done) {
        require(["app/NearestLayer"], function (nearestLayer) {
            widget = new nearestLayer(layerProps, 'widgetLayer');
            NearestLayer = nearestLayer;

            widget.startup();
            done();
        });
    },
    createWidget = function (props) {
        if (widget) {
            widget.destroy();
            widget = null;
        }

        widget = new NearestLayer(props, 'widgetLayer');
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


    it("should generate a title if not set", function (done) {
        var props = layerProps;
        props.layerInfo.popupInfo.title = "";
        props.results.layerInfo.popupInfo.title = "";
        createWidget(props);

        expect(widget.titleField.length).toEqual(1);
        done();
    });
    
    it("should set the layer as expanded", function (done) {
        var props = layerProps;
        props.layerOptions.display = "fixed";
        createWidget(props);

        expect(widget.expanded).toEqual(true);
        done();
    });

    it("should hide the counters", function (done) {
        var props = layerProps;
        props.layerOptions.showCounters = false;
        createWidget(props);

        expect(widget.showCountersVisible).toEqual("none");
        done();
    });
});