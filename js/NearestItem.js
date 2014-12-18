/*global define, console*/


define([
    'dojo/text!./templates/NearestItem.html',
    'dojo/_base/declare',
    "dojo/_base/lang",
    'dijit/_Widget',
    'dijit/_TemplatedMixin',
    'dijit/_WidgetsInTemplateMixin',
    'dojo/dom-construct',
    'dojo/topic',
    'dojo/on',
    './_NearestBase'
],
function (
    template, declare, lang, 
    _Widget, _TemplatedMixin, _WidgetsInTemplateMixin, domConstruct, topic, on, _NearestBase) {

    return declare([_Widget, _NearestBase, _TemplatedMixin, _WidgetsInTemplateMixin], {
        // description:
        //    Find the nearest features around a point

        templateString: template,
        baseClass: 'nearestItem',
        widgetsInTemplate: true,

        // Properties to be sent into constructor

        constructor: function (options, srcRefNode) {
            this.options = {
                feature: null,
                layerItemId: "",
                distanceUnits: "miles", // The units the distance is in.
                distance: 999, // The distance the feature is from the location.
                featureNumber: 0, // The index or number this feature is in the list
                showOnMap: false, // Show / hide the link for showing on a map
                showOnMapLinktext: "Show on map", // The text to use for the link
                description: "",
                fieldValues: null,
                titleText: "",
                titleField: "",
                renderer: null
            };

            // mix in settings and defaults
            var defaults = lang.mixin({}, this.options, options);

            // Set properties
            this.set("feature", defaults.feature);
            this.set("layerItemId", defaults.layerItemId);
            this.set("distanceUnits", defaults.distanceUnits);
            this.set("distance", defaults.distance);
            this.set("featureNumber", defaults.featureNumber);
            this.set("showOnMap", defaults.showOnMap);
            this.set("showOnMapLinktext", defaults.showOnMapLinktext);
            this.set("description", defaults.description);
            this.set("fieldValues", defaults.fieldValues);
            this.set("titleText", defaults.titleText);
            this.set("titleField", defaults.titleField);
            this.set("renderer", defaults.renderer);

            // widget node
            this.domNode = srcRefNode;
        },

        postMixInProperties: function () {
            var featureNameEle, attributes = this.feature.feature.attributes, listFields;

            if (!this._isNullOrEmpty(attributes[this.titleField[0]])) {
                featureNameEle = attributes[this.titleField[0]];
                featureNameEle = featureNameEle.toString().replace(/ /g, '-');
            }
            else {
                // Crap data, null value so lets just make one up.
                featureNameEle = this.layerItemId + "-" + this.featureNumber + "title";
            }
            // Remove any special characters that may cause element name errors
            featureNameEle = featureNameEle.replace(/[^\w\s-]/gi, '');
            featureNameEle = featureNameEle + "-" + this.featureNumber + "-" + this.layerItemId;

            this.set("featureId", featureNameEle);
            this.set("featureTitle", this._getTitle(this.titleText, this.titleField, attributes));

            if (this.showOnMap) {
                this.set("showOnMapVisible", "block");
            }
            else {
                this.set("showOnMapVisible", "none");
            }
            

            this.inherited(arguments);
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

            // Add the details of the feature required as specified by the Popup configuration
            listFields = null;

            if (!this._isNullOrEmpty(this.description)) {
                var desc = domConstruct.toDom(this.description);

                domConstruct.place(desc, this.featureDetails, "last");
            }
            else {
                // Build description from fields and values
            }
            

            this.setupConnections();

            this.inherited(arguments);
        },

        // start widget. called by user
        startup: function () {

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
            var _this = this;

            on(this.mapButton, "click", function (evt) {
                topic.publish("Nearest::showonmap", _this.feature, _this.renderer);
            });
        }


        /* ---------------- */
        /* Public Functions */
        /* ---------------- */


        /* ---------------- */
        /* Private Functions */
        /* ---------------- */
       
        
    });
});