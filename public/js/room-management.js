$(document).ready(function () {
	//set the booking tab as the active tab in the sidebar
	$('#nav-room').addClass('active');

	//reload the page the new information
	$('#chosen-time').change(function (){
		chooseTime();
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
