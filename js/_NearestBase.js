/*global define, console*/


define([
    'dojo/_base/declare',
    'dijit/_WidgetBase'
],
function (declare, _WidgetBase) {

    return declare([_WidgetBase], {
       


        /* ---------------- */
        /* Public Functions */
        /* ---------------- */


        /* ---------------- */
        /* Private Functions */
        /* ---------------- */
        _isNullOrEmpty: function (obj) {
            return (obj === undefined || obj === null || obj === '');
        }
    });
});