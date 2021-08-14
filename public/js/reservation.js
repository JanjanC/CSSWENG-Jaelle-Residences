$(document).ready(function () {
	$('#submit').click(function() {
		return validateEntry();
	});
});

function validateEntry () {

	let isValid = true;

	console.log($('#reserve_type_select').val());

	if ($('#reserve_type_select').val() == null) {
		$('#reserve-type-error').text('Room Type cannot be empty');
		isValid = false;
	} else {
		$('#reserve-type-error').text('');
	}

	if ($('#start-date').val() == '') {
		$('#start-date-error').text('Room Type cannot be empty');
		isValid = false;
	} else {
		$('#start-date-error').text('');
	}

	if ($('#end-date').val() == '') {
		$('#end-date-error').text('End Date cannot be empty');
		isValid = false;
	} else if ($('#start-date').val() != '' && $('#end-date').val() != '' && new Date($('#end-date').val()) < new Date($('#start-date').val())) {
		$('#end-date-error').text('End Date cannot earlier than Start Date');
		isValid = false;
	} else {
		$('#end-date-error').text('');
	}

	 //the date input field is empty
	if ($('#firstname').val() == '' || $('#firstname').val().trim().length == 0) {
		$('#firstname-error').text('First Name cannot be empty');
		isValid = false;
	} else {
		$('#firstname-error').text('');
	}

	if ($('#lastname').val() == '' || $('#lastname').val().trim().length == 0) {
		$('#lastname-error').text('Last Name cannot be empty');
		isValid = false;
	} else {
		$('#lastname-error').text('');
	}

	return isValid;
}
