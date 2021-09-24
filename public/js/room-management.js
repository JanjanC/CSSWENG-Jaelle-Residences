//import the necessary modules
const electron = require("electron");
//retrieves the necessary attributes from electron
const {ipcRenderer} = electron;

$(document).ready(function () {
	let index;
	//set the booking tab as the active tab in the sidebar
	$('#nav-room').addClass('active');

	//reload the page based on the selected time of the user
	$('#chosen-time').change(function (){
		chooseTime();
	});

	//redirect to the print preview page
	$(".print-link").on("click", function(e) {
		e.preventDefault();

		//retrieve the booking ID from the url
		let href = e.target.getAttribute('href');
		let bookingID = href.split('/')[2];

		//opens a new window with the print preview
		ipcRenderer.send('print:goto', bookingID);
	});

	//retrieves the booking ID from the room card
	$(".room-card").on("click", function(e) {
		index = e.target.getAttribute('data-index')
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
