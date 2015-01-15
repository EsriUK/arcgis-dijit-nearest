

describe("A set of tests for the Nearest base widget", function () {
    var _NearestBase, widget, server,
        loadWidget = function (done) {
            require(["app/_NearestBase"], function (_nearestBase) {
                widget = new _nearestBase({}, 'widgetBase');
                _NearestBase = _nearestBase;

                widget.itemUrl = "http://www.arcgis.com/sharing/rest/content/items/";

                widget.startup();
                done();
            });
        };


    var setupSinon = function () {
        server = sinon.fakeServer.create();
        server.autoRespond = true;
        server.autoRespondAfter = 257;
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

    it("should provide _isNullOrEmpty function", function (done) {
        expect(widget._isNullOrEmpty(null)).toEqual(true);
        done();
    });

    it("should return true for null, undefined or empty", function (done) {
        expect(widget._isNullOrEmpty(null)).toEqual(true);
        expect(widget._isNullOrEmpty(undefined)).toEqual(true);
        expect(widget._isNullOrEmpty("")).toEqual(true);
        done();
    });

    it("should return false when not null, undefined or empty", function (done) {
        expect(widget._isNullOrEmpty(1)).toEqual(false);
        expect(widget._isNullOrEmpty({})).toEqual(false);
        expect(widget._isNullOrEmpty("d22")).toEqual(false);
        done();
    });


    it("should replace the fields in the text with the values", function (done) {
        var text = "blah blah {bob}, something else: {tings}. Then this happened {what}", values = {
            bob: "Hello?",
            tings: 1234,
            what: "Morning"
        }, finalText = "blah blah Hello?, something else: 1234. Then this happened Morning"

        expect(widget._fieldReplace(text, values)).toEqual(finalText);
        done();
    });


    it("should return an items details", function (done) {
        var url = "http://www.arcgis.com/sharing/rest/content/items/", itemId = "1234567890",
            requestUrl = url + itemId + "?f=pjson";

    
        setupSinon();

        server.respondWith(requestUrl, [
            200,
            {
                "Content-Type": "application/json"
            },
            JSON.stringify({ "success": true, data: itemDetails })
        ]);

        widget._getItem(itemId, "", false).then(function (data) {
            server.restore();
            expect(data.success).toEqual(true);
            expect(data.data.name).toEqual("BorisBikesYP");

            done();
        });

    });

    it("should return an items data", function (done) {
        var url = "http://www.arcgis.com/sharing/rest/content/items/", itemId = "1234567890",
            requestUrl = url + itemId + "/data/?f=pjson";

        setupSinon();

        server.respondWith(requestUrl, [
            200,
            {
                "Content-Type": "application/json"
            },
            JSON.stringify({ "success": true, data: itemData })
        ]);

        widget._getItemData(itemId, "", true).then(function (data) {
            server.restore();
            expect(data.success).toEqual(true);
            expect(data.data.operationalLayers.length).toEqual(3);

            done();
        });
    });

    it("should add the token when returning an items details", function (done) {
        var url = "http://www.arcgis.com/sharing/rest/content/items/", itemId = "1234567890",
            token = "s23d43f3f5vbv656b565",
            requestUrl = url + itemId + "?f=pjson&token=" + token;


        setupSinon();

        server.respondWith(requestUrl, [
            200,
            {
                "Content-Type": "application/json"
            },
            JSON.stringify({ "success": true, data: itemDetails })
        ]);

        widget._getItem(itemId, token, false).then(function (data) {
            server.restore();
            expect(data.success).toEqual(true);
            expect(data.data.name).toEqual("BorisBikesYP");

            done();
        });

    });

});