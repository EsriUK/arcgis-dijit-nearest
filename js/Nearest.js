/*global define, console*/


define([
    'dojo/text!./templates/Nearest.html',
    'dojo/_base/declare',
    "dojo/_base/lang",
    "dojo/_base/Deferred",
    'dijit/_WidgetBase',
    'dijit/_TemplatedMixin',
    'dijit/_WidgetsInTemplateMixin',
    './FindNearestTask'
],
function (
    template, declare, lang, Deferred, _WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin, FindNearestTask) {

    return declare([_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin], {
        // description:
        //    Find the nearest features around a point

        templateString: template,
        baseClass: 'nearest',
        widgetsInTemplate: true,

        // Properties to be sent into constructor

        constructor: function (options, srcRefNode) {
            this.options = {
                webmapId: "", // The id of the webmap to use.
                maxResults: 10, // The maximum number of features to return.
                searchRadius: 5, // The search radius in miles.
                display: "expandable" // Howw to display the results. Expandable or fixed.
            };

            // mix in settings and defaults
            var defaults = lang.mixin({}, this.options, options);

            // Set properties
            this.set("webmapId", defaults.webmapId);
            this.set("maxResults", defaults.maxResults);
            this.set("searchRadius", defaults.searchRadius);
            this.set("display", defaults.display);

            // widget node
            this.domNode = srcRefNode;
        },

        buildRendering: function () {
            this.inherited(arguments);

        },


        postCreate: function() {
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

        setupConnections: function() {
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

        _createList: function() {
            // clear node
            this._features.innerHTML = '';

            // For each feature add it to the list using the NearestItem widget 
        },

        _init: function () {
            // Do query and build results

            // Output events
        }
    });
});