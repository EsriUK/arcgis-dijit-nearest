/*global define, console*/


define([
    'dojo/text!./templates/NearestItem.html',
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
        baseClass: 'nearest',
        widgetsInTemplate: true,

        // Properties to be sent into constructor

        constructor: function (options, srcRefNode) {
            this.options = {
                featureId: dijit.registry.getUniqueId(this.declaredClass), // The id of the feature.
                distanceUnits: "miles", // The units the distance is in.
                distance: 999, // The distance the feature is from the location.
                featureDetails: "Some details", // The details to display for the feature.
                featureTitle: "Feature Title" // The title of the feature
            };

            // mix in settings and defaults
            var defaults = lang.mixin({}, this.options, options);

            this.featureCount = 0;


            // Set properties
            this.set("featureId", defaults.featureId);
            this.set("distanceUnits", defaults.distanceUnits);
            this.set("distance", defaults.distance);
            this.set("featureDetails", defaults.featureDetails);
            this.set("featureTitle", defaults.featureTitle);

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
            // Do query and build results

            // Output events
        }
    });
});