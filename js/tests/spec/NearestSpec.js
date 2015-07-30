
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
    var baseWidget, Nearest, Point, SpatialReference, location, widget, server, loadWidget = function (done) {
        require(["app/Nearest", "esri/geometry/Point", "esri/SpatialReference", "app/_NearestBase"], function (_Nearest, _Point, _SpatialReference, _NearestBase) {
            widget = new _Nearest({}, 'widgetNode');

            widget.itemUrl = "http://www.arcgis.com/sharing/rest/content/items/";

            Point = _Point;
            Nearest = _Nearest;
            SpatialReference = _SpatialReference;

            baseWidget = new _NearestBase();
            baseWidget.startup();

            location = new Point("-0.8055515", "51.8003171", new SpatialReference({ wkid: 4326 }));
            
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

        widget = new Nearest(props, 'widgetNode');

        widget.itemUrl = swapProtocol("http://www.arcgis.com/sharing/rest/content/items/");
        widget.startup();
    };

    var setupSinon = function () {
        var requestUrl = swapProtocol("http://www.arcgis.com/sharing/rest/content/items/12345?f=pjson");
        var dataurl = swapProtocol("http://www.arcgis.com/sharing/rest/content/items/12345/data/?f=pjson"), itemId = "12345";
        var featureServiceUrl = swapProtocol("http://services1.arcgis.com/blah/arcgis/rest/services/MyRelatedData/FeatureServer/1?f=json");

        server = sinon.fakeServer.create();
        server.autoRespond = true;
        server.autoRespondAfter = 257;
        server.respondImmediately = true;

        server.respondWith(featureServiceUrl, [
            200,
            {
                "Content-Type": "application/json"
            },
            JSON.stringify(featureLayer)
        ]);

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

        server.respondWith(swapProtocol(itemData.operationalLayers[0].url + "?f=json"), [
            200,
            {
                "Content-Type": "application/json"
            },
            JSON.stringify(itemDetails)
        ]);
        server.respondWith(swapProtocol(itemData.operationalLayers[1].url + "?f=json"), [
            200,
            {
                "Content-Type": "application/json"
            },
            JSON.stringify(itemDetails)
        ]);
        server.respondWith(swapProtocol(itemData.operationalLayers[2].url + "?f=json"), [
            200,
            {
                "Content-Type": "application/json"
            },
            JSON.stringify(itemDetails)
        ]);
        server.respondWith(swapProtocol("http://services.arcgis.com/Qo2anKIAMzIEkIJB/arcgis/rest/services/BorisBikesYP/FeatureServer/0/query"), [
            200,
            {
                "Content-Type": "application/json"
            },
            JSON.stringify(pointFeatureSet)
        ]);
        server.respondWith(swapProtocol("http://services.arcgis.com/Qo2anKIAMzIEkIJB/arcgis/rest/services/NewhamSchools/FeatureServer/0/query"), [
            200,
            {
                "Content-Type": "application/json"
            },
            JSON.stringify(pointFeatureSet)
        ]);
        server.respondWith(swapProtocol("http://services.arcgis.com/Qo2anKIAMzIEkIJB/arcgis/rest/services/Tube2/FeatureServer/0/query"), [
            200,
            {
                "Content-Type": "application/json"
            },
            JSON.stringify(lineFeatureSet)
        ]);
        server.respondWith(swapProtocol("http://www.arcgis.com/sharing/rest/content/items/0713c71403f94013a399ab54910ec8bf/data/?f=pjson"), [
            200,
            {
                "Content-Type": "application/json"
            },
            JSON.stringify(itemData)
        ]);
        server.respondWith(swapProtocol("http://www.arcgis.com/sharing/rest/content/items/000/data/?f=pjson"), [
            200,
            {
                "Content-Type": "application/json"
            },
            JSON.stringify(emptyItemData)
        ]);
        server.respondWith(swapProtocol("http://www.arcgis.com/sharing/rest/content/items/12345678901234567890/data/?f=pjson"), [
            200,
            {
                "Content-Type": "application/json"
            },
            JSON.stringify(popupData)            
        ]);
        server.respondWith(swapProtocol("http://services.arcgis.com/111/arcgis/rest/services/BorisBikesYP/FeatureServer/0/query"), [
            200,
            {
                "Content-Type": "application/json"
            },
            JSON.stringify(emptyFeatureSet)
        ]);
        server.respondWith(swapProtocol("http://services.arcgis.com/111/arcgis/rest/services/BorisBikesYP/FeatureServer/0?f=json"), [
            200,
            {
                "Content-Type": "application/json"
            },
            JSON.stringify(itemDetails)
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
        if (server) {
            server.restore();
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
        expect(widget.showOnMap).toEqual(true);
        expect(widget.showCounters).toEqual(true);
        expect(widget.showDistance).toEqual(true);
        expect(widget.findNearestMode).toEqual("geodesic");
        expect(widget.showEmptyLayers).toEqual(true);

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

    it("should load the data for popupinfo if its not in the webmap", function (done) {
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

                nearestWidget._getLayerDetails([{ itemId: "12345678901234567890", id: "BorisBikesYP_2466", title: "TfL Cycle Hire Locations" }]);

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

    it("should fire the loaded event", function (done) {
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
            var handleLoaded = topic.subscribe("Nearest::loaded", function (nearestWidget) {
                expect(nearestWidget.webmapId).toEqual("0713c71403f94013a399ab54910ec8bf");
                connect.unsubscribe(handleLoaded);
                done();
            });

            createWidget(props);
        });
    });

    it("should fire the data loaded event", function (done) {
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
            var handleDataLoaded = topic.subscribe("Nearest::data-loaded", function (nearestWidget) {
                expect(nearestWidget.webmapId).toEqual("0713c71403f94013a399ab54910ec8bf");
                connect.unsubscribe(handleDataLoaded);
            });
            var handleLoaded = topic.subscribe("Nearest::loaded", function (nearestWidget) {
                connect.unsubscribe(handleLoaded);
                done();
            });

            createWidget(props);
        });
    });

    it("should fire the query-done event", function (done) {
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

            var handleQueryDone = topic.subscribe("Nearest::query-done", function (nearestWidget, queryResults) {
                expect(queryResults.length).toBeGreaterThan(0);
                connect.unsubscribe(handleQueryDone);
            });
            var handleLoaded = topic.subscribe("Nearest::loaded", function (nearestWidget) {
                connect.unsubscribe(handleLoaded);
                done();
            });

            createWidget(props);
        });
    });

    it("should fire the task-done event", function (done) {
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

            var handleTaskDone = topic.subscribe("Nearest::nearest-task-done", function (nearestWidget, nearestResults) {
                expect(nearestResults.length).toBeGreaterThan(0);
                connect.unsubscribe(handleTaskDone);
            });
            var handleLoaded = topic.subscribe("Nearest::loaded", function (nearestWidget) {
                connect.unsubscribe(handleLoaded);
                done();
            });

            createWidget(props);
        });
    });

    it("should handle layers with no results", function (done) {
        var props = nearestProps;
        setupSinon();

        props.webmapId = "000";
        props.location = location;
        props.showEmptyLayers = true
        props.layerOptions = [{
            itemId: "123",
            searchRadius: 50,
            showOnMap: false,
            showCounters: false
        }];

        require(['dojo/topic', 'dojo/_base/connect'], function (topic, connect) {
            var handleTaskDone = topic.subscribe("Nearest::nearest-task-done", function (nearestWidget, nearestResults) {
                expect(nearestResults[0].result.length).toEqual(0);
                connect.unsubscribe(handleTaskDone);
            });

            var handleLoaded = topic.subscribe("Nearest::loaded", function (nearestWidget) {
                expect(nearestWidget.webmapId).toEqual("000");
                connect.unsubscribe(handleLoaded);
                done();
            });

            createWidget(props);
        });
    });

    it("should get only the layers used for queries", function (done) {
        var props = nearestProps;
        setupSinon();

        props.location = location;
        props.webmapId = "";
        props.layerOptions = [{
            itemId: "fe37166bf13143d19a91d6e9bf96c8c5",
            searchRadius: 50,
            showOnMap: false,
            showCounters: false
        }, {
            itemId: "fe37166bf13143d19a91d6e9bf96c8c4",
            searchRadius: 50,
            showOnMap: false,
            showCounters: false,
            usage: "display"
        }];

        require(['dojo/topic', 'dojo/_base/connect'], function (topic, connect) {

            var handle = topic.subscribe("Nearest::loaded", function (nearestWidget) {
                //var opts = nearestWidget._getlayerOptions("fe37166bf13143d19a91d6e9bf96c8c5");

                var layers = nearestWidget._filterOperationalLayers([{ id: "1", itemId: "fe37166bf13143d19a91d6e9bf96c8c5" }, { id: "2", itemId: "fe37166bf13143d19a91d6e9bf96c8c4" }]);

                expect(layers.length).toEqual(1);
               

                connect.unsubscribe(handle);

                done();
            });

            createWidget(props);
        });
    });
});