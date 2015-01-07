/*global define, console*/


define([
    'dojo/text!./templates/Nearest.html',
    'dojo/_base/declare',
    "dojo/_base/lang",
    "dojo/promise/all",
    'dijit/_Widget',
    'dijit/_TemplatedMixin',
    'dijit/_WidgetsInTemplateMixin',
    './_NearestBase',
    "dojo/dom-construct",
    "esri/request",
    "./tasks/ClientNearestTask",
    "./tasks/LayerInfoTask",
    "./NearestLayer"
],
function (
    template, declare, lang, all, _Widget, _TemplatedMixin, _WidgetsInTemplateMixin, _NearestBase, domConstruct, esriRequest, ClientNearestTask, LayerInfoTask, NearestLayer) {

    return declare([_Widget, _NearestBase, _TemplatedMixin, _WidgetsInTemplateMixin], {
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
                display: "expandable", // How to display the results. Expandable or fixed.
                layerOptions: [] // Options for each layer. These override the default radius and max results
            };

            /*
                layerOptions:[
                    {
                        itemId: ""
                        maxResults:
                        searchRadius:,
                        showOnMap: 
                        showCounters:
                    }
                ]
            */

            // mix in settings and defaults
            var defaults = lang.mixin({}, this.options, options);

            // Set properties
            this.set("webmapId", defaults.webmapId);
            this.set("location", defaults.location);
            this.set("maxResults", defaults.maxResults);
            this.set("searchRadius", defaults.searchRadius);
            this.set("display", defaults.display);
            this.set("layerOptions", defaults.layerOptions);


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
                    var queryTasks = [], lpInd = 0, i = 0, iL = 0, task = null, opLayers, layerOpts;

                    if (webMap) {
                        _this.webMap = webMap;
                        opLayers = webMap.operationalLayers;

                        // Get the details and pop up information for each layer
                        _this._getLayerDetails(opLayers);

                        // Run a query to get the features
                        // Go through operational layers and query each one
                        for (i = 0, iL = opLayers.length; i < iL; i++) {
                            layerOpts = _this._getlayerOptions(opLayers[i].itemId);
                            
                            // check if layer has a url to be able to perform a query
                            if (!_this._isNullOrEmpty(opLayers[i].url)) {
                                task = new LayerInfoTask({
                                    currentPoint: _this.location,
                                    searchRadius: layerOpts.searchRadius,
                                    serviceUrl: opLayers[i].url,
                                    layerId: opLayers[i].id,
                                    itemId: opLayers[i].itemId
                                });

                                queryTasks.push(task.execute());
                            } 
                        }

                        // Once all queries have finished do the find nearest
                        all(queryTasks).then(function (queryResults) {
                            var j = 0, jL = queryResults.length, nearestTask = null, nearestTasks = [], layerName = "", layerOpts;

                            for (j = 0; j < jL; j++) {
                                layerOpts = _this._getlayerOptions(queryResults[j].itemId);

                                // Perform find nearest on each set of features
                                if ((queryResults[j].error === null) && (queryResults[j].results.features.length > 0)) {

                                    nearestTask = new ClientNearestTask({
                                        maxResults: layerOpts.maxResults,
                                        layerId: queryResults[j].id,
                                        itemId: queryResults[j].itemId
                                    });

                                    nearestTasks.push(nearestTask.execute(_this.location, queryResults[j].results, queryResults[j].layerInfo));
                                }
                            }

                            // Once all of the find nearest tasks have finished display the results
                            all(nearestTasks).then(function (nearestResults) {
                                var k = 0, kL = nearestResults.length;

                                // nearestResults is an array of arrays of the results
                                // So an array of layers, each layer has a set of results

                                for (k = 0; k < kL; k++) {
                                    if (nearestResults[k].error === null && nearestResults[k].result !== null) {
                                        if (nearestResults[k].result.limitExceeded) {

                                            layerName = "";
                                            for (lpInd = 0; lpInd < _this.layerPopUpFields.length; lpInd++) {
                                                if (_this.layerPopUpFields[lpInd].id === nearestResults[k].id) {
                                                    layerName = _this.layerPopUpFields[lpInd].layerName;
                                                    break;
                                                }
                                            }

                                            break;
                                        }
                                        _this._displayResults(nearestResults[k]);
                                    }
                                }
                                //displayResults
                            }, function (err) {

                            });
                        });
                    }
                });
            }
            // Output events
        },

        _getlayerOptions: function(itemId) {
            var i = 0, iL = 0;

            if(this.layerOptions) {
                for (i = 0, iL = this.layerOptions.length; i < iL; i++) {
                    if (this.layerOptions[i].itemId === itemId) {
                        return this.layerOptions[i];
                    }
                }
            }
            return {
                maxResults: this.maxResults,
                searchRadius: this.searchRadius,
                showOnMap: false,
                showCounters: true
            };
        },

        _displayResults: function(results) {
            var lpInd = 0, currentLayerInd, layerInfo, layerDiv, layer, layerOpts;
         
            // Make sure there are some results
            if (!this._isNullOrEmpty(results) && !this._isNullOrEmpty(results.result)) {

                for (lpInd = 0; lpInd < this.layerPopUpFields.length; lpInd++) {
                    if (this.layerPopUpFields[lpInd].id === results.id) {
                        currentLayerInd = lpInd;
                        break;
                    }
                }

                layerInfo = this.layerPopUpFields[currentLayerInd];
                
                // layer node
                layerDiv = domConstruct.create("div", {
                    className: "panel-body"
                });
                domConstruct.place(layerDiv, this._layers, "last");

                layerOpts = this._getlayerOptions(results.itemId);

                layer = new NearestLayer({
                    results: results,
                    layerInfo: layerInfo,
                    maxFeatures: layerOpts.maxResults,
                    distance: layerOpts.searchRadius,
                    distanceUnits: "miles",
                    display: this.display,
                    showOnMap: layerOpts.showOnMap,
                    showCounters: layerOpts.showCounters
                }, layerDiv);

                layer.startup();
            }
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