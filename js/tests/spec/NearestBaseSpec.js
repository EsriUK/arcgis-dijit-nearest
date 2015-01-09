

describe("A set of tests to test the Nearest base widget", function () {
    var _NearestBase, widget, loadWidget = function (done) {
        require(["app/_NearestBase"], function (_nearestBase) {
            widget = new _nearestBase({}, 'widgetBase');
            _NearestBase = _nearestBase;

            widget.startup();
            done();
        });
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

});