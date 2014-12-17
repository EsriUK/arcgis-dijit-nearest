/*global define, console*/


define([
    'dojo/_base/declare',
    'dijit/_WidgetBase'
],
function (declare, _WidgetBase) {
    // module:
    //      _NearestBase

    return declare([_WidgetBase], {
        // summary:
        //		Base class for the Nearest, NearstLayer and NearestItem widgets.


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
        },

        _getTitle: function (titleText, titleField, attributes) {
            // summary:
            //		Replaces any fields in the text with the values for the fields.
            // tags:
            //		private

            var ind;

            if (titleField.length > 0) {
                for (ind = 0; ind < titleField.length; ind++) {
                    titleText = titleText.replace('{' + titleField[ind] + '}', attributes[titleField[ind]]);
                }
                return titleText;
            }
            return titleText;
        }
    });
});