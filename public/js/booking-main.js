$(document).ready(function () {
	$('#booking-sidebar').addClass('active');

	$('#chosen-time').change(function (){
		chooseTime();
	});
});

function chooseTime() {
	let time = $('#chosen-time').val();
	let href = location.protocol + '//' + location.host + location.pathname;
	console.log(href);
	window.location.href = `${href}?time=${time}`;
}
