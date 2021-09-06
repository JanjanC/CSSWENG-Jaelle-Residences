$(document).ready(function () {
	$('#reservation-sidebar').addClass('active');
	//onclick event of the button with an id of 'submit'
	$('#submit').click(function() {
		return validateEntry();
	});

	$('#reserve').on('click', function(){
		let detailsLeft = [];
		let detailsRight = [];
		pushToArray(detailsLeft, 'Room Type', $('#reserve_type_select').val());
		pushToArray(detailsLeft, 'Start Date', $('#start-date').val());
		pushToArray(detailsRight, 'End Date', $('#end-date').val());
		pushToArray(detailsRight, 'First Name', $('#firstname').val());
		pushToArray(detailsRight, 'Last Name', $('#lastname').val());
		pushToArray(detailsRight, 'Birthdate', $('#birthdate').val());
		pushToArray(detailsRight, 'Address', $('#address').val());
		pushToArray(detailsRight, 'Contact No.', $('#contact').val());
		pushToArray(detailsRight, 'Company Name', $('#company').val());
		pushToArray(detailsRight, 'Occupation', $('#occupation').val());
		let messageLeft = detailsLeft.join('');
		let messageRight = detailsRight.join('');

		$('#input-col-1').html(messageLeft);
		$('#input-col-2').html(messageRight);
		$('#reserveModal').modal('show');
	});
});

function pushToArray(array, field, value){
	if(value.trim() != ''){
		array.push(`
		<h4>${field}:</h4>
		<h5 class="ms-4 text-secondary reservation-field">${value}</h5>
		`);
	}
}

function validateEntry () {

	let isValid = true;

	//no room type is selected
	if ($('#reserve_type_select').val() == '') {
		$('#reserve-type-error').text('Room Type cannot be empty');
		isValid = false;
	} else {
		$('#reserve-type-error').text('');
	}

	//get the date today in the format of YYYY-MM-DD
	let today = new Date();
	let todayString = `${today.getFullYear().toString()}-${(today.getMonth() + 1).toString().padStart(2, 0)}-${today.getDate().toString().padStart(2, 0)}`;
	let fiveYearString = `${(today.getFullYear() + 5).toString()}-${(today.getMonth() + 1).toString().padStart(2, 0)}-${today.getDate().toString().padStart(2, 0)}`;

	//the start date input field is empty
	if ($('#start-date').val() == '') {
		$('#start-date-error').text('Start Date cannot be empty');
		isValid = false;
	// the start date is earlier than today
	} else if (new Date($('#start-date').val()) < new Date(todayString)) {
		$('#start-date-error').text('Start Date cannot be earlier than Today');
		isValid = false;
	} else if (new Date($('#start-date').val()) > new Date(fiveYearString)) {
		$('#start-date-error').text('Start Date may only be 5 Years from Today');
		isValid = false;
	} else {
		$('#start-date-error').text('');
	}

	//the end date input field is empty
	if ($('#end-date').val() == '') {
		$('#end-date-error').text('End Date cannot be empty');
		isValid = false;
	// the end date is earlier than today
	} else if (new Date($('#end-date').val()) < new Date(todayString)) {
		$('#end-date-error').text('End Date cannot be earlier than Today');
		isValid = false;
	// the end date is earlier than the start date
	} else if ($('#start-date').val() != '' && new Date($('#end-date').val()) < new Date($('#start-date').val())) {
		$('#end-date-error').text('End Date cannot be earlier than Start Date');
		isValid = false;
	} else if (new Date($('#end-date').val()) > new Date(fiveYearString)) {
		$('#end-date-error').text('End Date may only be 5 Years from Today');
		isValid = false;
	} else {
		$('#end-date-error').text('');
	}

	//the first name input field is empty OR the input only consists of whitespaces
	if ($('#firstname').val() == '' || $('#firstname').val().trim().length == 0) {
		$('#firstname-error').text('First Name cannot be empty');
		isValid = false;
	} else {
		$('#firstname-error').text('');
	}

	//the last name input field is empty OR the input only consists of whitespaces
	if ($('#lastname').val() == '' || $('#lastname').val().trim().length == 0) {
		$('#lastname-error').text('Last Name cannot be empty');
		isValid = false;
	} else {
		$('#lastname-error').text('');
	}

	let numberPattern = new RegExp('^(09)\\d{9}$');
	if ($('#contact').val() != '' && !numberPattern.test($('#contact').val())) {
		$('#contact-error').text('Contact Number is invalid');
		isValid = false;
	} else {
		$('#contact-error').text('');
	}

	if (new Date($('#birthdate').val()) > new Date(todayString)) {
		$('#birthdate-error').text('Birthdate cannot be later than Today');
		isValid = false;
	} else {
		$('#birthdate-error').text('');
	}

	return isValid;
}
