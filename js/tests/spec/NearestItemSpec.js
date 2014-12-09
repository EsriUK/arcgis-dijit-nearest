



describe("A set of tests to test the Nearest Item widget", function() {
    var widget, loadWidget = function(done) {
        require(["app/NearestItem"], function (NearestItem) {
            widget = new NearestItem({}, 'widgetItem');

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
        expect(widget.featureId).toEqual("dijit._WidgetsInTemplateMixin_1");
        expect(widget.distanceUnits).toEqual("miles");
        expect(widget.distance).toEqual(999);
        expect(widget.featureDetails).toEqual("Some details");
        expect(widget.featureTitle).toEqual("Feature Title");
        done();
    });

});