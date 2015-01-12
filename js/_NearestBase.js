/*global define, console*/


define([
    'dojo/_base/declare',
    'dijit/_WidgetBase',
    "esri/request"
],
function (declare, _Widget, esriRequest) {
    // module:
    //      _NearestBase

    return declare([_Widget], {
        // summary:
        //		Base class for the Nearest, NearstLayer and NearestItem widgets.

        itemUrl: "//www.arcgis.com/sharing/rest/content/items/",

        _getItem: function (itemId, token, isDataItem) {
            // summary:
            //		Gets an item or its data from AGOL
            // tags:
            //		private

            var tokenPart = "", url = this.itemUrl + itemId;

            if (!this._isNullOrEmpty(token)) {
                tokenPart = "&token=" + encodeURIComponent(token);
            }

            if (isDataItem) {
                url = url + "/data/";
            }

            return esriRequest({
                url: url + "?f=pjson" + tokenPart
            });
        },

        _getItemData: function (itemId, token) {
            // summary:
            //		Gets an items data from AGOL
            // tags:
            //		private
            return this._getItem(itemId, token, true);
        },

        _isNullOrEmpty: function (/*Anything*/ obj) {
            // summary:
            //		Checks to see if the passed in thing is undefined, null or empty.
            // tags:
            //		private

            return (obj === undefined || obj === null || obj === '');
        },

        _fieldReplace: function (/*String*/text, /*Object Array*/attributes) {
            // summary:
            //		Replaces any fields in the text with the values for the fields.
            // tags:
            //		private

            var desc = text, field;

            for (field in attributes) {
                if (attributes.hasOwnProperty(field)) {
                    if (text.indexOf(field) > -1) {
                        desc = desc.replace('{' + field + '}', attributes[field]);
                    }
                }
            }

            return desc;
        }
    });
});