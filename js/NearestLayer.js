/*global define, console*/


define([
    'dojo/text!./templates/NearestLayer.html',
    'dojo/_base/declare',
    "dojo/_base/lang",
    "dojo/_base/Deferred",
    'dijit/_WidgetBase',
    'dijit/_TemplatedMixin',
    'dijit/_WidgetsInTemplateMixin'
],
function (
    template, declare, lang, Deferred,
    _WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin) {

    return declare([_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin], {
        // description:
        //    Find the nearest features around a point

        templateString: template,
        baseClass: 'nearestLayer',
        widgetsInTemplate: true,

        // Properties to be sent into constructor

        constructor: function (options, srcRefNode) {
            this.options = {
                numberOfFeatures: 0,
                layerName: "",
                layerId: "",
                maxFeatures: 5,
                distance: 0,
                distanceUnits: "miles",
                features: null
            };

            // mix in settings and defaults
            var defaults = lang.mixin({}, this.options, options);

            // Set properties
            this.set("numberOfFeatures", defaults.numberOfFeatures);
            this.set("layerName", defaults.layerName);
            this.set("layerId", defaults.layerId);
            this.set("maxFeatures", defaults.maxFeatures);
            this.set("distance", defaults.distance);
            this.set("distanceUnits", defaults.distanceUnits);
            this.set("features", defaults.features);

            // widget node
            this.domNode = srcRefNode;
        },

        buildRendering: function () {
            this.inherited(arguments);

        },


        postCreate: function () {
            // summary:
            //    Overrides method of same name in dijit._Widget.
            // tags:
            //    private
            //console.log('app.Nearest::postCreate', arguments);

            this.setupConnections();

            this.inherited(arguments);
        },

        // start widget. called by user
        startup: function () {
            this._init();
        },

        // connections/subscriptions will be cleaned up during the destroy() lifecycle phase
        destroy: function () {
            // call the superclass method of the same name.
            this.inherited(arguments);
        },

        setupConnections: function () {
            // summary:
            //    wire events, and such
            //
            //console.log('app.Nearest::setupConnections', arguments);

        },


        /* ---------------- */
        /* Public Functions */
        /* ---------------- */


        /* ---------------- */
        /* Private Functions */
        /* ---------------- */
        _init: function () {
            if (this.features) {

            }
        },

        _createFeaturesList: function () {
            var _this = this, features, featureNameEle, featureElem,
            featureInd = 0, fL = 0;

            // For each feature and a sub row
            for (featureInd = 0, fL = this.features.length; featureInd < fL; featureInd++) {
                attributes = features[featureInd].feature.attributes;

                if (!_isNullOrEmpty(attributes[titleField[0]])) {
                    featureNameEle = attributes[titleField[0]];
                    featureNameEle = featureNameEle.toString().replace(/ /g, '-');
                }
                else {
                    // Crap data, null value so lets just make one up.
                    featureNameEle = results.id + "-" + featureInd + "title";
                }
                // Remove any special characters that may cause element name errors
                featureNameEle = featureNameEle.replace(/[^\w\s-]/gi, '');
                featureNameEle = featureNameEle + "-" + featureInd + "-" + layerItemId;

            }
        }

    });
});