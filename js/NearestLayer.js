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
    'dojo/text!./templates/NearestLayer.html',
    'dojo/_base/declare',
    "dojo/_base/lang",
    'dijit/_Widget',
    'dijit/_TemplatedMixin',
    'dijit/_WidgetsInTemplateMixin',
    'dojo/dom-construct',
    './_NearestBase',
    './NearestItem',
    'esri/dijit/PopupTemplate',
    'dojo/topic',
    'dojo/on',
    'esri/dijit/PopupRenderer',
    'esri/graphic',
    'dojo/i18n!./nls/Nearest',
    'esri/layers/GraphicsLayer'
],
function (
    template, declare, lang, _Widget, _TemplatedMixin, _WidgetsInTemplateMixin, domConstruct, _NearestBase, NearestItem, PopupTemplate, topic, on, PopupRenderer, Graphic, i18n, GraphicsLayer) {

    return declare([_Widget, _NearestBase, _TemplatedMixin, _WidgetsInTemplateMixin], {
        // description:
        //    Find the nearest features around a point

        templateString: template,
        baseClass: 'nearestLayer',
        widgetsInTemplate: true,
        titleText: "",
        titleField: [],
        expanded: false,

        // Properties to be sent into constructor

        constructor: function (options, srcRefNode) {
            this.options = {
                results: null,
                layerInfo: null,
                maxFeatures: 5,
                distance: 0,
                distanceUnits: "m",
                layerOptions: null,
                parentId: ""
            };

            // mix in settings and defaults
            var defaults = lang.mixin({}, this.options, options);

            // Set properties
            this.set("results", defaults.results);
            this.set("layerInfo", defaults.layerInfo);
            this.set("maxFeatures", defaults.maxFeatures);
            this.set("distance", defaults.distance);
            this.set("distanceUnits", defaults.distanceUnits);
            this.set("layerOptions", defaults.layerOptions);
            this.set("parentId", defaults.parentId);

            // widget node
            this.domNode = srcRefNode;
        },


        postMixInProperties: function () {
            var result = this.results.result,
                template = new PopupTemplate(this.layerInfo.popupInfo),
                layerName = this.layerInfo.layerName,
                layerItemId = this.results.id.replace(/ /g, '-'),
                titleTextSplit, indT = 0, layerNameEle;

            this.titleText = template.info.title.toString();
            this.titleField = [];

            // Check the title to see if it contains a field
            titleTextSplit = this.titleText.split('}');

            for (indT = 0; indT < titleTextSplit.length; indT++) {
                if (titleTextSplit[indT].indexOf('{') > -1) {
                    this.titleField.push(titleTextSplit[indT].substr(titleTextSplit[indT].indexOf('{') + 1));
                }
            }

            if (this.titleField.length === 0) {
                this.titleField.push(template.info.fieldInfos[0].fieldName);
            }

            // For each layer in the results add a row to the list
            layerNameEle = this.results.id.replace(/ /g, '-');

            // Remove any special characters that may cause element name errors
            layerNameEle = layerNameEle.replace(/[^\w\s-]/gi, '');

            // Add in item id
            layerNameEle = layerNameEle + "-" + layerItemId;

            this.set("layerName", layerName || this.results.id);
            this.set("layerId", layerNameEle);
            this.set("numberOfFeatures", result.length);

            if (this.layerOptions.display === "fixed") {
                this.set("expanded", true);
                this.set("expandedClass", "in");
                this.set("collapseClass", "");
                this.set("layerHref", "#/");
                this.set("fixedClass", "nearestLayer-fixed");
            }
            else {
                this.set("expanded", false);
                this.set("expandedClass", "");
                this.set("collapseClass", "collapse");
                this.set("layerHref", "#" + layerNameEle);
                this.set("fixedClass", "nearestLayer-expandable");
            }

            if (this.layerOptions.showCounters) {
                this.set("showCountersVisible", "block");
            }
            else {
                this.set("showCountersVisible","none");
            }

            if (this.numberOfFeatures === 0) {
                this.set("counterWording", i18n.noresults + " " + this.distance + " " + this._getDistanceUnits(this.distanceUnits));
            }
            else {
                this.set("counterWording", i18n.showingclosest + " " + this.numberOfFeatures + " " + i18n.within + " " + this.distance + " " + this._getDistanceUnits(this.distanceUnits));
            }

            this.inherited(arguments);
        },


        postCreate: function () {
            // summary:
            //    Overrides method of same name in dijit._Widget.
            // tags:
            //    private

            this._init();
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
            var _this = this;

            // Fire event for clicking on layer name if not using fixed layout
            if (this.layerOptions.display !== "fixed") {
                on(this.showList, "click", function (evt) {
                    _this.expanded = !_this.expanded;
                    topic.publish("Nearest::show-layer", _this.results.result, _this.results.layerInfo, _this.expanded, _this);
                });
            }
        },


        /* ---------------- */
        /* Public Functions */
        /* ---------------- */


        /* ---------------- */
        /* Private Functions */
        /* ---------------- */
        
        _init: function () {
            // summary:
            //    If we have any results then display them
            //
            if (this.results.result) {
                this._createFeaturesList();
            }
        },

        _createFeaturesList: function () {
            // summary:
            //    Creates the list of items for this layer from the features list.
            //

            var attributes, item,
            featureInd = 0, fL = 0, feature, itemDiv,
            template = new PopupTemplate(this.layerInfo.popupInfo), g, rend;

            // For each feature and a sub row
            for (featureInd = 0, fL = this.results.result.length; featureInd < fL; featureInd++) {
                feature = this.results.result[featureInd];
                attributes = feature.feature.attributes;

                // Set the info template for the feature
                this.results.result[featureInd].feature.infoTemplate = template;
                g = new Graphic(this.results.result[featureInd].feature.geometry, this.results.layerInfo.renderer, feature.feature.attributes, template);

                // Add graphic to layer, graphicslayer?
                layer = new GraphicsLayer();
                layer.add(g);

                rend = new PopupRenderer({ template: template, graphic: g });
                rend.startup();
         

                // layer node
                itemDiv = domConstruct.create("div", {});
                domConstruct.place(itemDiv, this._features, "last");

                item = new NearestItem({
                    feature: feature,
                    layerItemId: this.layerId,
                    distanceUnits: this.distanceUnits,
                    distance: this.results.result[featureInd].distance.toFixed(2),
                    titleText: this.titleText,
                    titleField: this.titleField,
                    featureNumber: 1 + parseInt(featureInd, 10),
                    description: rend.domNode.innerHTML,
                    renderer: this.results.layerInfo.renderer,
                    opacity: this.results.layerInfo.opacity,
                    layerOptions: this.layerOptions
                }, itemDiv);

                item.startup();

            }
        }
    });
});