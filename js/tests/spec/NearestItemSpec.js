



describe("A set of tests to test the Nearest Item widget", function() {
    var NearestItem, widget, loadWidget = function (done) {
        require(["app/NearestItem"], function (nearestItem) {
            widget = new nearestItem({}, 'widgetItem');
            NearestItem = nearestItem;

            widget.startup();
            done();
        });
    }, featureProps = {
        featureId: "asdr34ff4ff4",
        distanceUnits: "miles",
        distance: 1.34,
        featureDetails: "Details <p>More</p>",
        featureTitle: "Im a title",
        featureNumber: 12
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
        expect(widget.featureNumber).toEqual(0);
        done();
    });


    it("should set the properties when passed in via the constructor", function (done) {
        if (widget) {
            widget.destroy();
        }

        widget = new NearestItem(featureProps, 'widgetItem');
        widget.startup();

        expect(widget.distance).toEqual(featureProps.distance);
        expect(widget.featureId).toEqual(featureProps.featureId);
        expect(widget.distanceUnits).toEqual(featureProps.distanceUnits);
        expect(widget.distance).toEqual(featureProps.distance);
        expect(widget.featureDetails).toEqual(featureProps.featureDetails);
        expect(widget.featureTitle).toEqual(featureProps.featureTitle);
        expect(widget.featureNumber).toEqual(featureProps.featureNumber);

        done();
    });



});