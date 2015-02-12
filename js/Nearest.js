/*global define, console*/

/*
 | Copyright 2015 ESRI (UK) Limited
 |
 | Licensed under the Apache License, Version 2.0 (the "License");
 | you may not use this file except in compliance with the License.
 | You may obtain a copy of the License at
 |
 |    http://www.apache.org/licenses/LICENSE-2.0
 |
 | Unless required by applicable law or agreed to in writing, software
 | distributed under the License is distributed on an "AS IS" BASIS,
 | WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 | See the License for the specific language governing permissions and
 | limitations under the License.
 */

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
    "./tasks/ClientNearestTask",
    "./tasks/LayerInfoTask",
    "./NearestLayer",
    'dojo/topic',
    'dojo/i18n',
    'dojo/i18n!./nls/Nearest'
],
function (
    template, declare, lang, all, _Widget, _TemplatedMixin, _WidgetsInTemplateMixin, _NearestBase, domConstruct, ClientNearestTask, LayerInfoTask, NearestLayer, topic, i18n) {

    return declare([_Widget, _NearestBase, _TemplatedMixin, _WidgetsInTemplateMixin], {
        // description:
        //    Find the nearest features around a point

        templateString: template,
        baseClass: 'nearest',
        widgetsInTemplate: true,
        
        layerPopUpFields: [],

        // Properties to be sent into constructor

        constructor: function (options, srcRefNode) {
            this.options = {
                webmapId: "", // The id of the webmap to use.
                location: null, // The location to use as the centre point. 
                maxResults: 10, // The maximum number of features to return.
                searchRadius: 5, // The search radius in miles.
                display: "expandable", // How to display the results. Expandable or fixed.
                layerOptions: [], // Options for each layer. These override the default radius and max results
                showOnMap: true, // Display the 'Show On Map' link
                showCounters: true, // Show the feature counts
                showDistance: true, // Show the distance
                findNearestMode: "geodesic", // Set the mode for the find nearest calculation
                showEmptyLayers: true // Should layers show with no results
            };

            /*
                layerOptions:[
                    {
                        itemId: ""
                        maxResults:
                        searchRadius:,
                        showOnMap: 
                        showCounters:
                        display:
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
            this.set("showOnMap", defaults.showOnMap);
            this.set("showCounters", defaults.showCounters);
            this.set("showDistance", defaults.showDistance);
            this.set("findNearestMode", defaults.findNearestMode);
            this.set("showEmptyLayers", defaults.showEmptyLayers);

            // language
            this._i18n = i18n;

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


        _init: function () {
            var _this = this;

            // Do query and build results
            if (!this._isNullOrEmpty(this.webmapId)) {
                this._getItemData(this.webmapId, this.token).then(function (webMap) {
                    var queryTasks = [], i = 0, iL = 0, task = null, opLayers, layerOpts;

                    if (webMap) {
                        topic.publish("Nearest::data-loaded", _this);


                        _this.webMap = webMap;
                        opLayers = webMap.operationalLayers;

                        // Get the details and pop up information for each layer
                        _this._getLayerDetails(opLayers);

                        // Run a query to get the features
                        // Go through operational layers and query each one
                        for (i = 0, iL = opLayers.length; i < iL; i++) {
                            layerOpts = _this._getlayerOptions(opLayers[i].itemId, opLayers[i].id);

                            // check if layer has a url to be able to perform a query
                            if (!_this._isNullOrEmpty(opLayers[i].url)) {
                                task = new LayerInfoTask({
                                    currentPoint: _this.location,
                                    searchRadius: layerOpts.searchRadius,
                                    serviceUrl: _this._swapProtocol(opLayers[i].url),
                                    layerId: opLayers[i].id,
                                    itemId: opLayers[i].itemId
                                });

                                queryTasks.push(task.execute());
                            }
                        }

                        // Once all queries have finished do the find nearest
                        all(queryTasks).then(function (queryResults) {
                            var j = 0, jL = queryResults.length, nearestTask = null, nearestTasks = [], layerName = "", layerOpts;

                            topic.publish("Nearest::query-done", _this, queryResults);

                            for (j = 0; j < jL; j++) {
                                layerOpts = _this._getlayerOptions(queryResults[j].itemId, queryResults[j].id);

                                // Perform find nearest on each set of features
                                if (((queryResults[j].error === null) && (queryResults[j].results) && (queryResults[j].results.features.length > 0)) || (_this.showEmptyLayers && queryResults[j].error === null)) {

                                    nearestTask = new ClientNearestTask({
                                        maxResults: layerOpts.maxResults,
                                        layerId: queryResults[j].id,
                                        itemId: queryResults[j].itemId,
                                        mode: _this.findNearestMode
                                    });

                                    nearestTasks.push(nearestTask.execute(_this.location, queryResults[j].results, queryResults[j].layerInfo));
                                }
                            }

                            // Once all of the find nearest tasks have finished display the results
                            all(nearestTasks).then(function (nearestResults) {
                                var k = 0, kL = nearestResults.length, lpInd = 0;

                                topic.publish("Nearest::nearest-task-done", _this, nearestResults);

                                for (k = 0; k < kL; k++) {
                                    if (nearestResults[k].error === null && nearestResults[k].result !== null) {
                                        _this._displayResults(nearestResults[k]);
                                    }
                                }

                                // Finished
                                topic.publish("Nearest::loaded", _this);

                                //displayResults
                            }, function (err) {

                            });
                        });
                    }
                });
            }
            else {
                topic.publish("Nearest::loaded", this);
            }
            // Output events
        },

        _getlayerOptions: function(itemId, id) {
            var i = 0, iL = 0, layerOpts = {
                webmapId: this.webmapId,
                maxResults: this.maxResults,
                searchRadius: this.searchRadius,
                showOnMap: this.showOnMap,
                showCounters: this.showCounters,
                display: this.display,
                showDistance: this.showDistance
            },
            field = "itemId", value = itemId;
                

            if ((this.layerOptions) && (this.layerOptions.length > 0)) {
                // If we have an id then use that, otherwise use the item id. Item id could be the same for all items.
                field = (!this._isNullOrEmpty(id) && !this._isNullOrEmpty(this.layerOptions[0].id)) ? "id" : "itemId";
                value = (field === "id") ? id : itemId;

                for (i = 0, iL = this.layerOptions.length; i < iL; i++) {
                    if (this.layerOptions[i][field] === value) {
                        return lang.mixin({}, layerOpts, this.layerOptions[i]);
                    }
                }
            }
            return layerOpts;
        },

        _displayResults: function(results) {
            var lpInd = 0, currentLayerInd, layerInfo, layerDiv, layer, layerOpts;
         
            // Make sure there are some results
            if ((this.showEmptyLayers) || (!this._isNullOrEmpty(results) && !this._isNullOrEmpty(results.result))) {

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

                layerOpts = this._getlayerOptions(results.itemId, results.id);

                layer = new NearestLayer({
                    results: results,
                    layerInfo: layerInfo,
                    maxFeatures: layerOpts.maxResults,
                    distance: layerOpts.searchRadius,
                    distanceUnits: "miles",
                    layerOptions: layerOpts
                }, layerDiv);

                layer.startup();
            }
        },

        _getLayerDetails: function (layers) {
            var _this = this, i = 0, iL = 0, popupInfo = null, fields = [], j = 0, jL = 0, layerFields = null;

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
                    else {
                        // Might not have the popup info saved with the webmap or it could be a feature collection

                        if (!this._isNullOrEmpty(layers[i].itemId)) {
                            var _layer = layers[i];

                            (function (l, t) {
                                t._getItemData(l.itemId).then(function (data) {
                                    if (data && data.layers) {
                                        var lFields = {
                                            "layerName": l.title,
                                            "id": l.id,
                                            "popupInfo": data.layers[0].popupInfo
                                        };

                                        t.layerPopUpFields.push(lFields);
                                    }
                                });
                            }(_layer, _this));
                        }
                        else if (!this._isNullOrEmpty(layers[i].featureCollection)) {
                            var _layers = layers[i].featureCollection.layers;

                            for (var k = 0; k < _layers.length; k++) {
                                var lyFields = {
                                    "layerName": _layers[k].popupInfo.title,
                                    "id": _layers[k].id,
                                    "popupInfo": _layers[k].popupInfo
                                };

                                _this.layerPopUpFields.push(lyFields);
                            }
                        }                        
                    }
                }
            }
        }

    });
});