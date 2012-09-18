// JavaScript Document

// Wait for Apache Cordova to load
document.addEventListener("deviceready", onDeviceReady, false);

var map;

// Apache Cordova is ready
function onDeviceReady() {
    
	getLocation();
	
	// Prevent screen bounce
	$(document).bind('touchmove', function (e) {
		e.preventDefault();
	});
}

function getLocation() {
    navigator.geolocation.getCurrentPosition(onGeolocationSuccess, onGeolocationError, { enableHighAccuracy: true });
}

function storesShow(e) {
    getLocation();
}

//=======================Geolocation Operations=======================//
// onGeolocationSuccess Geolocation
function onGeolocationSuccess(position) {
    
	// Use Google API to get the location data for the current coordinates
	var latlng = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
	
    var myOptions = {
		zoom: 12,
		center: latlng,
		mapTypeControl: false,
		navigationControlOptions: { style: google.maps.NavigationControlStyle.SMALL },
		mapTypeId: google.maps.MapTypeId.ROADMAP
	};
    
	map = new google.maps.Map(document.getElementById("map"), myOptions);
        
	var marker = new google.maps.Marker({
		position: latlng,
		map: map,
		title: 'Your Location'
	});
    
    // Set property markers
	var locations = [];
    
	// Get stores nearby
	// http://www.starbucks.com/api/location.ashx?&features=&lat=47.58827590942383&long=-122.0338363647461&limit=10
	$.getJSON("http://www.starbucks.com/api/location.ashx?&features=&lat=" + position.coords.latitude + "&long=" + position.coords.longitude + "&limit=10",
        function(data) {
            
            $.each(data, function(i, item) {
                
                locations.push(
                {
                    address: item.WalkInAddressDisplayStrings[0] + ", " + item.WalkInAddressDisplayStrings[1], 
                    latlng: new google.maps.LatLng(item.WalkInAddress.Coordinates.Latitude, item.WalkInAddress.Coordinates.Longitude)
                });                
            });
        })
        .complete(function() {
            setMarkers(locations);  
        })
	    .error(function(error) {
		    alert(error.message);
	    });
}

// onGeolocationError Callback receives a PositionError object
function onGeolocationError(error) {
	alert(error.message);
}

function setMarkers(locations) {
	var pinColor = "66CCFF";
	var pinImage = new google.maps.MarkerImage("http://chart.apis.google.com/chart?chst=d_map_pin_letter&chld=%E2%80%A2|" + pinColor,
											   new google.maps.Size(21, 34),
											   new google.maps.Point(0, 0),
											   new google.maps.Point(10, 34));
	var pinShadow = new google.maps.MarkerImage("http://chart.apis.google.com/chart?chst=d_map_pin_shadow",
												new google.maps.Size(40, 37),
												new google.maps.Point(0, 0),
												new google.maps.Point(12, 35));
    
    var markerImage = new google.maps.MarkerImage('images/icehorizontal_icon.png');
	var marker;
    
	for (i = 0; i < locations.length; i++) {
        /*
        marker = new google.maps.Marker({
                    position: locations[i].latlng,
                    map: map,
                    title: 'Jitterz Coffeehouse',
                    icon: markerImage
                });
        */
		marker = new google.maps.Marker({
			map: map,
			animation: google.maps.Animation.DROP,
			position: locations[i].latlng,
			title: locations[i].address,
			icon: pinImage, //icon: markerImage,
			shadow: pinShadow
		});
	}
}