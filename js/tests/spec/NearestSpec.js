



describe("A set of tests for the Nearest widget", function() {
    var widget, loadWidget = function(done) {
        require(["app/Nearest"], function (Nearest) {
            widget = new Nearest({}, 'widgetNode');

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

    it("should have default properties set", function (done) {
        expect(widget.maxResults).toEqual(10);
        expect(widget.searchRadius).toEqual(5);
        expect(widget.display).toEqual("expandable");
        expect(widget.webmapId).toEqual("");

        done();
    });

});