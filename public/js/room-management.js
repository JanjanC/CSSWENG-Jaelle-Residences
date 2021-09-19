//import the necessary modules
const electron = require("electron");
//retrieves the necessary attributes from electron
const {ipcRenderer} = electron;

$(document).ready(function () {
	$('#nav-room').addClass('active');

	$('#chosen-time').change(function (){
		chooseTime();
	});

	$(".print-link").on("click", function(e) {
		e.preventDefault();

		let href = $(".print-link").attr('href');
		let bookingID = href.split('/')[2];
		
	    ipcRenderer.send('print:goto', bookingID);
	});
});

function chooseTime() {
	let time = $('#chosen-time').val();
	let href = `${location.protocol}//${location.host}${location.pathname}`;

	window.location.replace(`${href}?time=${time}`);
}

