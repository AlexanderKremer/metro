var mainMap;
var allMarkers = [];
var userMarker;
var directionsService;
var directionsDisplay;

function initMap() {

	directionsService = new google.maps.DirectionsService;
  	directionsDisplay = new google.maps.DirectionsRenderer;

	//Get a reference to the map container (div)
	var mapContainer = document.querySelector('#map-container');

	// Set some map options
	var options = {
		center: {
			lat: -41.300439,
			lng: 174.780291
		},
		zoom: 15,
		minZoom: 14,
		zoomControl: false,
		mapTypeControl: false
		// scrollwheel: false
	};

	// Create a new Google Map
	mainMap = new google.maps.Map(mapContainer, options);

	directionsDisplay.setMap(mainMap);

	// Now we're ready to show the store markers
	placeStoreMarkers();

	// Find out if the user wants to share their location
	getUserLocation();
}

function placeStoreMarkers() {

	// Connect to database and get the locations
	var locations = [
		{
			title: "Wellington Railway Station",
			lat: -41.279228,
			lng: 174.780333
		},
		{
			title: "Fix Grand Arcade",
			lat: -41.286757,
			lng: 174.775874
		},
		{
			title: "Fix Manners Mall",
			lat: -41.290526,
			lng: 174.775967
		},
		{
			title: "Fix Cuba St",
			lat: -41.293184,
			lng: 174.775833
		},
		{
			title: "Fix Courtenay Place",
			lat: -41.293514,
			lng: 174.780839
		},
		{
			title: "Panache",
			lat: -41.283873, 
			lng: 174.775185
		}
	];

	// Loop over each location
	for( var i=0;  i<locations.length; i++ ) {

		// Create a new marker
		var marker = new google.maps.Marker({
			position : {
				lat: locations[i].lat,
				lng: locations[i].lng
			},
			map: mainMap,
			title: locations[i].title,
			icon:'img/nav-point.png',
			id: i
		});

		// Store this marker in the collection
		allMarkers.push(marker);

	}
	// Show the contents of the allMarkers array
	console.log(allMarkers);


}

function showChosenLocation() {

	// Get the element that triggered this function
	var selectElement = this;

	// Get the index of the option that was chosen
	var selectedOptionIndex = selectElement.selectedIndex;

	// Get the option that was selected
	var optionElement = selectElement[selectedOptionIndex];

	// Grab the text that is inside this option
	var optionText = optionElement.value;

	// this[this.selectedIndex].value;

	// Find the marker that matches the chosen option

	var theChosenMarker;
	for ( var i=0; i<allMarkers.length; i++) {

		// Is this the marker?
		if( optionText == allMarkers[i].title ) {
			// Found!
			theChosenMarker = allMarkers[i];
			// Make sure the loop finishes
			i = allMarkers.length;
		}

	}

	// Only if we found a marker
	if ( theChosenMarker != undefined ) {

		// Make Google Maps focus on the marker position
		mainMap.panTo({
			lat: theChosenMarker.getPosition().lat(),
			lng: theChosenMarker.getPosition().lng()
		});

		mainMap.setZoom(15);

	}

}

function getUserLocation() {

	// If geolocation exists as a feature on this device
	if ( navigator.geolocation ) {

		// Ask for the user location
		navigator.geolocation.getCurrentPosition(function(position){
			console.log(position);

			// Create a marker for the user
			userMarker = new google.maps.Marker({
				map: mainMap,
				position: {
					lat: position.coords.latitude,
					lng: position.coords.longitude
				},
				// icon: 'img/nav-point.png'
			});

			mainMap.panTo({
				lat: position.coords.latitude,
				lng: position.coords.longitude
			});

			// Work out the closest shop
			var userLocation = new google.maps.LatLng({
				lat: position.coords.latitude,
				lng: position.coords.longitude
			});

			var closestDistance = 9999999999999;
			var closestMarker;

			// Loop over all the locations
			for( var i=0; i<allMarkers.length; i++ ) {

				// Save a marker in a variable
				var marker = allMarkers[i];

				var markerLocation = new google.maps.LatLng({
					lat: marker.getPosition().lat(),
					lng: marker.getPosition().lng()
				});

				// Get distance
				var distance = google.maps.geometry.spherical.computeDistanceBetween(userLocation, markerLocation);
							console.log(distance);
			
				// Is this marker closer than the closest one so far?
				if( distance < closestDistance ) {

					// This is the new closest store
					closestDistance = distance;
					closestMarker = marker;
				}
			}

			console.log(closestMarker);

			calculateAndDisplayRoute(closestMarker);
		});
	}

function calculateAndDisplayRoute(closestMarker) {

	var pos1 = new google.maps.LatLng({
		lat: closestMarker.getPosition().lat(),
		lng: closestMarker.getPosition().lng()
	});

	var pos2 = new google.maps.LatLng({
		lat: userMarker.getPosition().lat(),
		lng: userMarker.getPosition().lng()
	});

	var options = {
	 	travelMode: google.maps.TravelMode.WALKING,
	 	origin: pos2,
	 	destination: pos1
	};

	 directionsService.route(options, function(response, status){
		if (status === google.maps.DirectionsStatus.OK) {
	      directionsDisplay.setDirections(response);
	    } else {
	      window.alert('Directions request failed due to ' + status);
	    }
	});
	}
}
