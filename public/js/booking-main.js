$(document).ready(function () {
	$('#booking-sidebar').addClass('active');

	$('#chosen-time').change(function (){
		date = new Date($('#hidden-date').text());
		console.log(date);
		console.log($('#chosen-time').val().slice(0,2));
		console.log($('#chosen-time').val().slice(-2));
		$.get('/time/booking', {day: date.getDate(), month: date.getMonth(), year: date.getFullYear(), hours: $('#chosen-time').val().slice(0,2), minutes: $('#chosen-time').val().slice(-2)}, function (){});
	});
});
