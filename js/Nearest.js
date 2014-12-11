/*global define, console*/


define([
    'dojo/text!./templates/Nearest.html',
    'dojo/_base/declare',
    "dojo/_base/lang",
    "dojo/_base/Deferred",
    'dijit/_WidgetBase',
    'dijit/_TemplatedMixin',
    'dijit/_WidgetsInTemplateMixin',
    "esri/request",
    './FindNearestTask'
],
function (
    template, declare, lang, Deferred, _WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin, esriRequest, FindNearestTask) {

    return declare([_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin], {
        // description:
        //    Find the nearest features around a point

        templateString: template,
        baseClass: 'nearest',
        widgetsInTemplate: true,
        itemUrl: "//www.arcgis.com/sharing/rest/content/items/",
        layerPopUpFields: [],

        // Properties to be sent into constructor

        constructor: function (options, srcRefNode) {
            this.options = {
                webmapId: "", // The id of the webmap to use.
                location: null, // The location to use as the centre point. 
                maxResults: 10, // The maximum number of features to return.
                searchRadius: 5, // The search radius in miles.
                display: "expandable", // Howw to display the results. Expandable or fixed.
                token: "" // The token to use for requests to AGOL
            };

            // mix in settings and defaults
            var defaults = lang.mixin({}, this.options, options);

            // Set properties
            this.set("webmapId", defaults.webmapId);
            this.set("location", defaults.location);
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
            this._init();
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
            var _this = this;

            // Do query and build results
            if (!this._isNullOrEmpty(this.webmapId)) {
                this._getItemData(this.webmapId, this.token).then(function (webMap) {
                    if (webMap) {
                        _this.webMap = webMap;

                        _this._getLayerDetails(webMap.operationalLayers);
                    }
                });
            }
            // Output events
        },

        _getItem: function (itemId, token, isDataItem) {
            var tokenPart = "", url = this.itemUrl + itemId;

            if (!this._isNullOrEmpty(token)) { 
                tokenPart = "&token=" + encodeURIComponent(token);
            }

            if (isDataItem) {
                url = url + "/data/";
            }

            return esriRequest({
                url: url + "?f=pjson" + tokenPart,
                content: { f: "json" }
            });
        },

        _getItemData: function (itemId, token) {
            return this._getItem(itemId, token, true);
        },

        _isNullOrEmpty: function (obj) {
            return (obj === undefined || obj === null || obj === '');
        },

        _getLayerDetails: function (layers) {
            var i = 0, iL = 0, popupInfo = null, fields = [], j = 0, jL = 0, layerFields = null;

            if (!this._isNullOrEmpty(layers)) {
                // Iterate through any operational layers
                for (i = 0, iL = layers.length; i < iL; i++) {

                    // check if it has any popups defined
                    if (layers[i].hasOwnProperty("popupInfo")) {
                        popupInfo = layers[i].popupInfo;
                        fields = [];

                        for (j = 0, jL = popupInfo.fieldInfos.length; j < jL; j++) {
                            // Check each field and see if it is visible in the popup
                            if (popupInfo.fieldInfos[j].visible) {
                                fields.push(popupInfo.fieldInfos[j].fieldName);
                            }
                        }

                        // If any fields are visible create an object to hold the fields and the layer name
                        layerFields = {
                            "layerName": layers[i].title,
                            "id": layers[i].id,
                            "fields": fields,
                            "popupInfo": popupInfo
                        };
                        this.layerPopUpFields.push(layerFields);
                        
                    }
                }
            }
        }

    });
});