//import the necessary modules
const electron = require("electron");
//retrieves the necessary attributes from electron
const {ipcRenderer} = electron;

$(document).ready(function () {
	//set the booking tab as the active tab in the sidebar
	$('#nav-room').addClass('active');

	//reload the page the new information
	$('#chosen-time').change(function (){
		chooseTime();
	});

	$(".print-link").on("click", function(e) {
		e.preventDefault();

		let roomCards = $(".print-link").toArray()
		let index = e.target.getAttribute('data-index')

		let targetRoomCard = roomCards[+index]
		let href = targetRoomCard.getAttribute('href');
		let bookingID = href.split('/')[2];
		
	    ipcRenderer.send('print:goto', bookingID);
	});
});

//loads the list bookings that are active in the specified time
function chooseTime() {
	//retrieve inputted from the time input
	let time = $('#chosen-time').val();

	//redirect to the url of booking page with the specified time
	let href = `${location.protocol}//${location.host}${location.pathname}`;
	window.location.replace(`${href}?time=${time}`);
}

