document.addEventListener("deviceready", onDeviceReady, false);

var mapElem,
cachedLocations = [];

// Apache Cordova is ready
function onDeviceReady() {
	// Prevent screen bounce
	$(document).bind("touchmove", function (e) {
		e.preventDefault();
	});
    
	//Append events
	appendModalViewAddNewCardButtonsEvent();

	$("#cardsView").on("click", ".listCard", function(e) {
		var cardId = $(e.currentTarget).data('cardid');
		initSingleCardView(cardId);
		centerSingleCard();
		appendCardFlipEffect();
		app.navigate('#singleCardView');
	});
   
	$("#cardsView").on("click", ".deleteCardButton", function(e) {
    	
		var cardNumberToDelete = $(e.currentTarget).parent().data('cardid');
		var message = "Are you sure that you want to permanently delete card with number ?";
        
		$("#modalViewDeleteCardMessage").text(message);
		$("#deleteMessage").text("Card Id:");
		$("#deleteCardId").text(cardNumberToDelete);
		$("#modalViewDeleteCard").kendoMobileModalView("open");
		e.stopPropagation();
	});
    
	$("#modalViewDeleteCard").on("click", '#buttonModalViewDeleteCancel', function() {
		$("#modalViewDeleteCard").kendoMobileModalView("close");
	});
    
	$("#modalViewDeleteCard").on("click", '#buttonModalViewDeleteConfirm', function() {
		var cardNumberToDelete = $("#deleteCardId").text();
		deleteCard(cardNumberToDelete);
		$("#modalViewDeleteCard").kendoMobileModalView("close");
	});
    
}

function getPosition(handler) {
	navigator.geolocation.getCurrentPosition(handler, onGeolocationError, { enableHighAccuracy: true });
}

function getLocations(position, handler) {
	$.getJSON("http://www.starbucks.com/api/location.ashx?&features=&lat=" + position.coords.latitude + "&long=" + position.coords.longitude + "&limit=10",
    function(data) {
      var locations = [];
      $.each(data, function() {
    	  locations.push(
    		  {
    		  address: this.WalkInAddressDisplayStrings[0] + ", " + this.WalkInAddressDisplayStrings[1], 
    		  latlng: new google.maps.LatLng(this.WalkInAddress.Coordinates.Latitude, this.WalkInAddress.Coordinates.Longitude)
    	  });                
      });
      handler(locations);
    }).error(function(error) {
        alert(error.message);
    });
}

function storesShow(e) {
	$("#storesNavigate").kendoMobileButtonGroup({
		select: function() {
			if (this.selectedIndex == 0) {
				$("#storeswrap").hide();
				$("#mapwrap").show();
				google.maps.event.trigger(map, "resize");
			}
			else if (this.selectedIndex == 1) {
				$("#mapwrap").hide();
				$("#storeswrap").show();
			}
		},
		index: 0
	});
    
	$('#map').bind("touchmove", function (e) {
		e.preventDefault();
	});
    
	var iteration = function() {
		getPosition(function(position) {
			// Use Google API to get the location data for the current coordinates
			var latlng = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
            
			var myOptions = {
				zoom: 12,
				center: latlng,
				mapTypeControl: false,
				navigationControlOptions: { style: google.maps.NavigationControlStyle.SMALL },
				mapTypeId: google.maps.MapTypeId.ROADMAP
			};
			mapElem = new google.maps.Map(document.getElementById("map"), myOptions);
			var marker = new google.maps.Marker({
				position: latlng,
				map: mapElem,
				title: "Your Location"
			});
        
			if (cachedLocations.length > 0) {
				setStiresViews(cachedLocations);
			}
			else {
            	
				getLocations(position, function(locations) {
					cachedLocations = locations;
					setStiresViews(locations);
				});
			}
		});
	};
	iteration();
}

var announcementData = [
	{ title: "Holiday Drinks Are Here", description: "Enjoy your favorite holiday drinks, like Pumpkin Spice Lattes.", url: "images/holiday.jpg" },
	{ title: "Register & Get Free Drinks", description: "Register any Jitterz card and start earning rewards like free drinks. Sign-up now.", url: "images/rewards.jpg" },
	{ title: "Cheers to Another Year", description: "Raise a cup of bold and spicy Jitterz Anniversary Blend.", url: "images/anniversary.jpg" }
];

function announcementListViewTemplatesInit() {
	$("#announcements-listview").kendoMobileListView({
		dataSource: kendo.data.DataSource.create({ data: announcementData }),
		template: $("#announcement-listview-template").html()
	});
}

function onGeolocationError(error) {
	alert(error.message);
}

function setStiresViews(locations) {
	var pinColor = "66CCFF";
	var pinImage = new google.maps.MarkerImage("http://chart.apis.google.com/chart?chst=d_map_pin_letter&chld=%E2%80%A2|" + pinColor,
											   new google.maps.Size(21, 34),
											   new google.maps.Point(0, 0),
											   new google.maps.Point(10, 34));
	var pinShadow = new google.maps.MarkerImage("http://chart.apis.google.com/chart?chst=d_map_pin_shadow",
												new google.maps.Size(40, 37),
												new google.maps.Point(0, 0),
												new google.maps.Point(12, 35));
    
	var markerImage = new google.maps.MarkerImage('icons/coffeecupbutton.png');
	var marker;
    
	for (i = 0; i < locations.length; i++) {
		marker = new google.maps.Marker({
			map: mapElem,
			animation: google.maps.Animation.DROP,
			position: locations[i].latlng,
			title: locations[i].address,
			icon: markerImage,
			shadow: pinShadow
		});
	}
	
	$("#stores-listview").kendoMobileListView({
		dataSource: kendo.data.DataSource.create({ data: locations}),
		template: $("#stores-listview-template").html()
	});
}

//Cards informations
var cardsData = kendo.observable({
	cardNumbers: {},
	cards : []
});

function addNewCard() {
	var cardNumberValue = $('#cardNumberField').val();
    
	var isValidCardNumber = validateCardNumber(cardNumberValue),
	    isDuplicateCardNumber = isDublicateNumber(cardNumberValue);
    
    var $addnewCardErrorLog = $('#addNewCardErrorLog'),
        $modalViewCardNumber = $('#modalViewAddCard');
    
	if (!isValidCardNumber) {
		$addnewCardErrorLog.text('Card number is nine digits code');
	}
	else if (isDuplicateCardNumber) {
		$addnewCardErrorLog.text('Dublicate record');
	}
	else {
		var currentAmount = Math.floor((Math.random()*100) + 10),
            bonusPoints = Math.floor((Math.random()*100) + 20);
        
		var cardToAdd = {
			cardNumber : cardNumberValue,
			amount: currentAmount,
            bonusPoints: bonusPoints
		}
        
		var positionAdded = cardsData.cards.push(cardToAdd) - 1;
        cardsData.cardNumbers[cardNumberValue] = positionAdded;
        
		$addnewCardErrorLog.text('');
		$modalViewCardNumber.kendoMobileModalView("close");
	}
}

function validateCardNumber(cardNumberValue) {
	var validateNumberRegex = /^[0-9]{9}$/;
	var isValidCardNumber = validateNumberRegex.test(cardNumberValue);
    
	return isValidCardNumber;
}

function isDublicateNumber(cardNumberValue) {
	var isDublicate = cardsData.cardNumbers.hasOwnProperty(cardNumberValue);
	return isDublicate;
}

function listViewCardsInit() {
	$("#cardsList").kendoMobileListView({
		dataSource: kendo.data.DataSource.create({data: cardsData.cards}),
		template: $("#cardsListTemplate").html()
	});
}

function appendCardFlipEffect() {
	var $cardFront = $("#cardFront"),
	    $cardBack = $("#cardBack");
    
	var width = $cardFront.width(),
	    height = $cardFront.height(),
        margin = $cardFront.width() / 2;
	
	$cardBack.stop().css({width:'0px',height:'' + height + 'px',marginLeft:'' + margin + 'px',opacity:'0.5'});
     
	$cardFront.click(function(e) {
		$(e.currentTarget).stop().animate({width:'0px',height:'' + height + 'px',marginLeft:'' + margin + 'px',opacity:'0.5'}, {duration:500});
		window.setTimeout(function() {
			$cardBack.show().animate({width:'' + width + 'px',height:'' + height + 'px',marginLeft:'0px',opacity:'1'}, {duration:500});
		}, 500);
	});
 
	$cardBack.click(function(e) {
		$(e.currentTarget).stop().animate({width:'0px',height:'' + height + 'px',marginLeft:'' + margin + 'px',opacity:'0.5'}, {duration:500});
		$(e.currentTarget).hide(500);
		window.setTimeout(function() {
			$cardFront.show().animate({width:'' + width + 'px',height:'' + height + 'px',marginLeft:'0px',opacity:'1'}, {duration:500});
		}, 500);
	});
}

function appendModalViewAddNewCardButtonsEvent() {
	$("#cardsView").on("click", "#buttonAddNewCard", function() {
		$("#modalViewAddCard").kendoMobileModalView("open");
	});
    
	$("#modalViewAddCard").on("click", "#modalViewAddCardCancelButton", function() {
		$("#modalViewAddCard").kendoMobileModalView("close");
	});
    
	$("#modalViewAddCard").on("click", "#modalViewAddCardButton", function() {
		addNewCard();
	});
}

function centerSingleCard() {
	var cardWidth = $("#cardFront").width(),
    	screenWidth = $(window).width(),
    	marginLeft = (screenWidth - cardWidth) / 2;
    
	$('#singleCardContainer').css("margin-left", marginLeft);
}

function deleteCard(cardId) {
    var allCardsArray = cardsData.cards;
    
	for (var i = -1, len = allCardsArray.length; ++i < len;) {
		if (allCardsArray[i].cardNumber === cardId) {
			allCardsArray.splice(i, 1);
			delete cardsData.cardNumbers[cardId];
            break;
		}
	} 
}

function initSingleCardView(cardId) {
	var cardPosition = cardsData.cardNumbers[cardId];
    var cardsArray = cardsData.cards;
    
    var barcodeUrl = generateBarcodeUrl(cardId),
        amount = cardsArray[cardPosition].amount,
        bonusPoints = cardsArray[cardPosition].bonusPoints,
        amountFormated = kendo.toString(amount, "c");
     
	var singleCardViewData = {
		barcodeUrl : barcodeUrl,
		cardId : cardId,
		cardAmount : amountFormated,
		bonusPoints : bonusPoints,
        currentDate : kendo.toString(new Date(), "yyyy/MM/dd hh:mm tt" )
	};
    
	var encodingTemplate = kendo.template($("#singleCardTamplate").text());
	$('#cardViewContent').html(encodingTemplate(singleCardViewData));
}

function generateBarcodeUrl(cardId) {
    
	var size = "150",
    	urlSizeParameter = "chs=" + size + "x" + size,
    	urlQrParameter = "cht=qr",
    	urlDataParameter = "chl=" + cardId,
    	urlBase = "https://chart.googleapis.com/chart?",
    	imageRequestString = urlBase + urlSizeParameter + "&" + urlQrParameter + "&" + urlDataParameter; 
    
	return imageRequestString;
}


/*------------------- Rewards ----------------------*/

function rewardsViewInit() {
	$("#rewordsCardsList").kendoMobileListView({
		dataSource: kendo.data.DataSource.create({data: cardsData.cards}),
		template: $("#rewordsCardsList-template").html()
	});
}

function rewardCardShow(e)
{
    var p = e;
}