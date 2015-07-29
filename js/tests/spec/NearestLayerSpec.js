
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
        },
        url: "http://services1.arcgis.com/blah/arcgis/rest/services/MyRelatedData/FeatureServer/1"
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
    var NearestLayer, widget, server, baseWidget, loadWidget = function (done) {
        require(["app/NearestLayer", "app/_NearestBase"], function (nearestLayer, _NearestBase) {
            widget = new nearestLayer(layerProps, 'widgetLayer');
            NearestLayer = nearestLayer;

            baseWidget = new _NearestBase();
            baseWidget.startup();

            setupSinon();

            widget.startup();
            done();
        });
    },
    swapProtocol = function (url) {
        return baseWidget._swapProtocol(url);
    },
    createWidget = function (props) {
        if (widget) {
            widget.destroy();
            widget = null;
        }
        
        widget = new NearestLayer(props, 'widgetLayer');
        widget.startup();
    };

    var setupSinon = function () {
        var requestUrl = swapProtocol("http://services1.arcgis.com/blah/arcgis/rest/services/MyRelatedData/FeatureServer/1?f=json");
        var dataurl = swapProtocol("http://www.arcgis.com/sharing/rest/content/items/12345/data/?f=pjson"), itemId = "12345";

        server = sinon.fakeServer.create();
        server.autoRespond = true;
        server.autoRespondAfter = 257;

        server.respondWith(requestUrl, [
            200,
            {
                "Content-Type": "application/json"
            },
            JSON.stringify(featureLayer)
        ]);
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