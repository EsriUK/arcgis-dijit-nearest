
var nearestProps = {
    webmapId: "12345", 
    location: null,
    maxResults: 4, 
    searchRadius: 23, 
    display: "expandable", 
    layerOptions: [],
    showOnMap: true,
    showCounters: true
}


describe("A set of tests for the Nearest widget", function() {
    var Nearest, Point, SpatialReference, location, widget, server, loadWidget = function (done) {
        require(["app/Nearest", "esri/geometry/Point", "esri/SpatialReference"], function (_Nearest, _Point, _SpatialReference) {
            widget = new _Nearest({}, 'widgetNode');

            Point = _Point;
            Nearest = _Nearest;
            SpatialReference = _SpatialReference;

            location = new Point("-0.8055515", "51.8003171", new SpatialReference({ wkid: 4326 }));

            widget.startup();
            done();
        });
    },
    createWidget = function (props) {
        if (widget) {
            widget.destroy();
            widget = null;
        }

        widget = new Nearest(props, 'widgetNode');
        widget.startup();
    };

    var setupSinon = function () {
        var requestUrl = "http://www.arcgis.com/sharing/rest/content/items/12345?f=pjson";
        var dataurl = "http://www.arcgis.com/sharing/rest/content/items/12345/data/?f=pjson", itemId = "12345";

        server = sinon.fakeServer.create();
        server.autoRespond = true;
        server.autoRespondAfter = 257;

        server.respondWith(requestUrl, [
            200,
            {
                "Content-Type": "application/json"
            },
            JSON.stringify(itemDetails)
        ]);
        server.respondWith(dataurl, [
            200,
            {
                "Content-Type": "application/json"
            },
            JSON.stringify(itemData)
        ]);

        server.respondWith(itemData.operationalLayers[0].url + "?f=json", [
            200,
            {
                "Content-Type": "application/json"
            },
            JSON.stringify(itemDetails)
        ]);
        server.respondWith(itemData.operationalLayers[1].url + "?f=json", [
            200,
            {
                "Content-Type": "application/json"
            },
            JSON.stringify(itemDetails)
        ]);
        server.respondWith(itemData.operationalLayers[2].url + "?f=json", [
            200,
            {
                "Content-Type": "application/json"
            },
            JSON.stringify(itemDetails)
        ]);
        server.respondWith("http://services.arcgis.com/Qo2anKIAMzIEkIJB/arcgis/rest/services/BorisBikesYP/FeatureServer/0/query", [
            200,
            {
                "Content-Type": "application/json"
            },
            JSON.stringify(pointFeatureSet)
        ]);
        server.respondWith("http://services.arcgis.com/Qo2anKIAMzIEkIJB/arcgis/rest/services/NewhamSchools/FeatureServer/0/query", [
            200,
            {
                "Content-Type": "application/json"
            },
            JSON.stringify(pointFeatureSet)
        ]);
        server.respondWith("http://services.arcgis.com/Qo2anKIAMzIEkIJB/arcgis/rest/services/Tube2/FeatureServer/0/query", [
            200,
            {
                "Content-Type": "application/json"
            },
            JSON.stringify(lineFeatureSet)
        ]);
        server.respondWith("http://www.arcgis.com/sharing/rest/content/items/0713c71403f94013a399ab54910ec8bf/data/?f=pjson", [
            200,
            {
                "Content-Type": "application/json"
            },
            JSON.stringify(itemData)
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

    it("should have default properties set", function (done) {
        expect(widget.maxResults).toEqual(10);
        expect(widget.searchRadius).toEqual(5);
        expect(widget.display).toEqual("expandable");
        expect(widget.webmapId).toEqual("");

        done();
    });

    it("should get the default options", function (done) {

        setupSinon();

        nearestProps.location = location;

        require(['dojo/topic', 'dojo/_base/connect'], function (topic, connect) {
            var handle = topic.subscribe("Nearest::loaded", function (nearestWidget) {
                var opts = nearestWidget._getlayerOptions("12345");

                expect(opts.webmapId).toEqual("12345");
                expect(opts.maxResults).toEqual(4);
                expect(opts.searchRadius).toEqual(23);

                connect.unsubscribe(handle);
                done();
            });

            createWidget(nearestProps);
        });
    });

    it("should get a mix of the default options and layer options", function (done) {
        var props = nearestProps;
        setupSinon();

        props.location = location;
        props.webmapId = "";
        props.layerOptions = [{
            itemId: "fe37166bf13143d19a91d6e9bf96c8c5",
            searchRadius: 50,
            showOnMap: false,
            showCounters: false
        }];

        require(['dojo/topic', 'dojo/_base/connect'], function (topic, connect) {

            var handle = topic.subscribe("Nearest::loaded", function (nearestWidget) {
                var opts = nearestWidget._getlayerOptions("fe37166bf13143d19a91d6e9bf96c8c5");

                expect(opts.webmapId).toEqual("");
                expect(opts.itemId).toEqual("fe37166bf13143d19a91d6e9bf96c8c5");
                expect(opts.showOnMap).toEqual(false);
                expect(opts.maxResults).toEqual(4);
                expect(opts.showCounters).toEqual(false);

                connect.unsubscribe(handle);

                done();
            });

            createWidget(props);
        });
    });

    it("should get the layer fields", function (done) {
        var props = nearestProps;
        setupSinon();

        props.location = location;
        props.webmapId = "";
        props.layerOptions = [{
            itemId: "fe37166bf13143d19a91d6e9bf96c8c5",
            searchRadius: 50,
            showOnMap: false,
            showCounters: false
        }];

        require(['dojo/topic', 'dojo/_base/connect'], function (topic, connect) {
            var handle = topic.subscribe("Nearest::loaded", function (nearestWidget) {
                nearestWidget._getLayerDetails([itemData.operationalLayers[0]]);
                expect(nearestWidget.layerPopUpFields[0].fields.length).toEqual(14);
                connect.unsubscribe(handle);
                done();
            });

            createWidget(props);
        });
    });

    it("should load all of the correct layer information", function (done) {
        var props = nearestProps;
        setupSinon();

        props.webmapId = "0713c71403f94013a399ab54910ec8bf";
        props.location = location;
        props.layerOptions = [{
            itemId: "fe37166bf13143d19a91d6e9bf96c8c5",
            searchRadius: 50,
            showOnMap: false,
            showCounters: false
        }];

        require(['dojo/topic', 'dojo/_base/connect'], function (topic, connect) {
            var handle = topic.subscribe("Nearest::loaded", function (nearestWidget) {
                expect(nearestWidget.webmapId).toEqual("0713c71403f94013a399ab54910ec8bf");
                connect.unsubscribe(handle);
                done();
            });

            createWidget(props);
        });
    });

});