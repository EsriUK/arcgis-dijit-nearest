/*global define, console, document */

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
        parseUrioptions: {
            strictMode: false,
            key: ["source","protocol","authority","userInfo","user","password","host","port","relative","path","directory","file","query","anchor"],
            q:   {
                name:   "queryKey",
                parser: /(?:^|&)([^&=]*)=?([^&]*)/g
            },
            parser: {
                strict: /^(?:([^:\/?#]+):)?(?:\/\/((?:(([^:@]*)(?::([^:@]*))?)?@)?([^:\/?#]*)(?::(\d*))?))?((((?:[^?#\/]*\/)*)([^?#]*))(?:\?([^#]*))?(?:#(.*))?)/,
                loose:  /^(?:(?![^:@]+:[^:@\/]*@)([^:\/?#.]+):)?(?:\/\/)?((?:(([^:@]*)(?::([^:@]*))?)?@)?([^:\/?#]*)(?::(\d*))?)(((\/(?:[^?#](?![^?#\/]*\.[^?#\/.]+(?:[?#]|$)))*\/?)?([^?#\/]*))(?:\?([^#]*))?(?:#(.*))?)/
            }
        },


        _parseUri: function(str) {
            // summary:
            //		Parses a URL into the various parts
            // tags:
            //		private

            var o = this.parseUrioptions,
		        m   = o.parser[o.strictMode ? "strict" : "loose"].exec(str),
		        uri = {},
		        i   = 14;

            while (i--) {
                uri[o.key[i]] = m[i] || "";
            }

            uri[o.q.name] = {};
            uri[o.key[12]].replace(o.q.parser, function ($0, $1, $2) {
                if ($1) {
                    uri[o.q.name][$1] = $2;
                }
            });

            return uri;
        },

        _swapProtocol: function (url) {
            // summary:
            //		Modifies the protocol of a URL if needed
            // tags:
            //		private

            var protocol = document.location.protocol,
                splitUri = this._parseUri(url);

            if (splitUri.protocol + ":" === protocol) {
                // Same protocol, no need to change it
                return url;
            }
            if (protocol === "file:") {
                // file protocol, change it to http. For unit tests
                return url.replace(protocol, "http:");
            }

            return url.replace(splitUri.protocol + ":", protocol);
        },

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