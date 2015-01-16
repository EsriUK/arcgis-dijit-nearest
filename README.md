arcgis-dijit-nearest [![Build Status](https://magnum.travis-ci.com/EsriUK/arcgis-dijit-nearest.svg?token=V92zP6znibt1RDMCNgRd)](https://magnum.travis-ci.com/EsriUK/arcgis-dijit-nearest)
====================

Nearest widget for finding features near a location


## Features
The Nearest widget provides a list of the nearest features around a location.

The widget is driven by a webmap. You configure the distance that you want to search and the maximum number of features you want to list. 
The widget finds all the features in each layer up to these limits that are in the webmap. The information is presented to the end user as a list view with the details of each feature.  
The details shown replicate those that are setup in the popup within your webmap.

## Quickstart
	
    myWidget = new Nearest({
		webmapId: "987654321123456789",
		location: new Point("-0.8055515", "51.8003171", new SpatialReference({ wkid: 4326 })),
        searchRadius: 50,
		maxResults: 5,
		display: "expandable",
		showOnMap: true,
		showCounters: true,
		showDistance: true
    }, "NearestWidget");

    myWidget.startup();

 [New to Github? Get started here.](https://github.com/)


## Setup
Set your dojo config to load the module.

	var package_path = window.location.pathname.substring(0, window.location.pathname.lastIndexOf('/'));
	var dojoConfig = {
		// The locationPath logic below may look confusing but all its doing is
		// enabling us to load the api from a CDN and load local modules from the correct location.
		packages: [{
			name: "application",
			location: package_path + '/js'
		}]
	};


## Require module
Include the module for the Nearest.

	require(["application/Nearest", ... ], function(Nearest, ... ){ ... });

## Constructor

Nearest(options, srcNode);

### Options (Object)
|property|required|type|value|description|
|---|---|---|---|---|
|webmapId|x|string|null|The id of the webmap that contains the layers to use for the nearest.|
|location|x|Point|null|The location to use for the query.|
|searchRadius||Integer|10|The radius to search within, in miles.|
|maxResults||Integer|5|The number of features to show.|
|display||string|'expandable'|How to display the results. Expandable or fixed.|
|showOnMap||Boolean|true|Display the 'Show On Map' link.|
|showCounters||Boolean|true|Show the feature counts.|
|showDistance||Boolean|true|Show the distance.|
|layerOptions||Object Array|null|Options for each layer. These override the default options per layer in the web map.|


### layerOptions
This is an array of objects that contain overridden options per layer. You can override one or all layers in the webmap. Any layers not overridden will use the default options.
You do not have to include all options, just the options you want to override.

	layerOptions: [{
		itemId: '1234567'
        maxResults: 3
        searchRadius: 29,
        showOnMap: false
        showCounters: false
        display: 'fixed',
		showDistance: false
	}, {
		...
	}]


## Events
The widget publishes events at various stages of its lifecycle.

### data-loaded
	topic.subscribe("Nearest::data-loaded", function (widget) {});


### query-done
	topic.subscribe("Nearest::query-done", function (widget, queryResults) {});


### nearest-task-done
	topic.subscribe("Nearest::nearest-task-done", function (widget, nearestResults) {});


### loaded
	topic.subscribe("Nearest::loaded", function (widget) {});


### show-layer
	topic.subscribe("Nearest::show-layer", function (results, renderer, expanded) {});


### show-feature
	topic.subscribe("Nearest::show-feature", function (feature, renderer) {});



## Issues

Find a bug or want to request a new feature?  Please let us know by submitting an issue.

## Contributing

Anyone and everyone is welcome to contribute.


## Licensing

Copyright 2015 ESRI (UK) Limited

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

[http://www.apache.org/licenses/LICENSE-2.0](http://www.apache.org/licenses/LICENSE-2.0)

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the Licence.

A copy of the license is available in the repository's [license.txt](license.txt) file.