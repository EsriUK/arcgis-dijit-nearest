arcgis-dijit-nearest
====================

Nearest widget for finding features near a location


## Features
The Nearest widget provides a list of the nearest features around a location.

The widget is driven by a webmap. You configure the distance that you want to search and the maximum number of features you want to list. 
The widget finds all the features in each layer up to these limits that are in the webmap. The information is presented to the end user as a list view with the details of each feature.  
The details shown replicate those that are setup in the popup within your webmap.

## Quickstart
	
    myWidget = new Nearest({
		webmapId: "0713c71403f94013a399ab54910ec8bf",
		location: new Point("-0.8055515", "51.8003171", new SpatialReference({ wkid: 4326 })),
        searchRadius: 50,
		maxResults: 5
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