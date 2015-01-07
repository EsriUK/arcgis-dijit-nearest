/*global define, console*/


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
    "esri/dijit/PopupTemplate",
    "esri/graphic",
    'dojo/topic',
    'dojo/on',
    "esri/dijit/Popup"
],
function (
    template, declare, lang, _Widget, _TemplatedMixin, _WidgetsInTemplateMixin, domConstruct, _NearestBase, NearestItem, PopupTemplate, Graphic, topic, on, Popup) {

    return declare([_Widget, _NearestBase, _TemplatedMixin, _WidgetsInTemplateMixin], {
        // description:
        //    Find the nearest features around a point

        templateString: template,
        baseClass: 'nearestLayer',
        widgetsInTemplate: true,
        titleText: "",
        titleField: [],

        // Properties to be sent into constructor

        constructor: function (options, srcRefNode) {
            this.options = {
                results: null,
                layerInfo: null,
                maxFeatures: 5,
                distance: 0,
                distanceUnits: "miles",
                display: "expandable",
                showOnMap: false,
                showCounters: true
            };

            // mix in settings and defaults
            var defaults = lang.mixin({}, this.options, options);

            // Set properties
            this.set("results", defaults.results);
            this.set("layerInfo", defaults.layerInfo);
            this.set("maxFeatures", defaults.maxFeatures);
            this.set("distance", defaults.distance);
            this.set("distanceUnits", defaults.distanceUnits);
            this.set("display", defaults.display);
            this.set("showOnMap", defaults.showOnMap);
            this.set("showCounters", defaults.showCounters);

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

            if (this.display === "fixed") {
                this.set("expanded", true);
                this.set("expandedClass", "in");
                this.set("collapseClass", "");
            }
            else {
                this.set("expanded", false);
                this.set("expandedClass", "");
                this.set("collapseClass", "collapse");
            }

            if (this.showCounters) {
                this.set("showCountersVisible", "block");
            }
            else {
                this.set("showCountersVisible","none");
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

            // Fire show on map click event for list of features
            on(this.showList, "click", function (evt) {
                topic.publish("Nearest::show-list-onmap", _this.results.result);
            });

        },


        /* ---------------- */
        /* Public Functions */
        /* ---------------- */


        /* ---------------- */
        /* Private Functions */
        /* ---------------- */
        _init: function () {
            if (this.results.result) {
                this._createFeaturesList();
            }
        },

        _createFeaturesList: function () {
            var attributes, item,
            featureInd = 0, fL = 0, description = null, nameVals = [], feature, fieldArray, itemDiv,
            template = new PopupTemplate(this.layerInfo.popupInfo), field;

            // For each feature and a sub row
            for (featureInd = 0, fL = this.results.result.length; featureInd < fL; featureInd++) {
                feature = this.results.result[featureInd];
                attributes = feature.feature.attributes;

                this.results.result[featureInd].feature.infoTemplate = template;
                this.results.result[featureInd].feature.setInfoTemplate(template);
                var g = new Graphic(this.results.result[featureInd].feature.geometry, this.results.layerInfo.renderer, feature.feature.attributes, template);

                var pDiv = domConstruct.create("div", {});
                var p = new Popup({ features: [this.results.result[featureInd].feature] }, pDiv);
                p.startup();
                p.selectedIndex = 0;
                p.setFeatures([this.results.result[featureInd].feature]);
                
                //p._featureSelected();

                //infoWindow.setFeatures(result.features);

                var fe = p.getSelectedFeature();
                var content = fe.getContent();

                // Need to check if we have a configured popup or if we are just listing the fields.
                if (!this._isNullOrEmpty(this.layerInfo.popupInfo.description) && this.layerInfo.popupInfo.description.length > 0) {
                    // We have a configured pop up description so lets use that
                    description = this._fieldReplace(template.info.description, attributes);
                }
                else {
                    // Not configured, just list the fields
                    fieldArray = this.layerInfo.fields;
                    nameVals = [];

                    for (field in attributes) {
                        if (attributes.hasOwnProperty(field)) {
                            // check if the current field is in the layerPopUpFields array before adding to the list
                            if (fieldArray.indexOf(field) > -1) {
                                nameVals.push({
                                    fieldName: template._fieldsMap[field].label,
                                    fieldValue: attributes[field]
                                });
                            }
                        }
                    }
                }

                // See if we have some media info to create
                if (!this._isNullOrEmpty(this.layerInfo.popupInfo.mediaInfos) && this.layerInfo.popupInfo.mediaInfos.length > 0) {

                }

                // layer node
                itemDiv = domConstruct.create("div", {});
                domConstruct.place(itemDiv, this._features, "last");

                item = new NearestItem({
                    feature: feature,
                    layerItemId: this.layerId,
                    distanceUnits: "miles",
                    distance: this.results.result[featureInd].distance.toFixed(2),
                    titleText: this.titleText,
                    titleField: this.titleField,
                    featureNumber: 1 + parseInt(featureInd, 10),
                    description: description,
                    fieldVlaues: nameVals,
                    showOnMap: this.showOnMap,
                    renderer: this.results.layerInfo.renderer,
                    cont: content
                }, itemDiv);

                item.startup();

            }
        }

    });
});