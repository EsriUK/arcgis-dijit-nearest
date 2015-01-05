


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
    showOnMap: false,
    showOnMapLinktext: "Show on map",
    description: "hello there",
    fieldValues: null,
    titleText: "The title",
    titleField: [],
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
        if (widget) {
            widget.destroy();
        }

        widget = new NearestItem(featureProps, 'widgetItem');
        widget.startup();

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

        done();
    });



});