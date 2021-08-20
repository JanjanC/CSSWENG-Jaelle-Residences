$(document).ready(function () {
	//onclick event of the button with an id of 'submit'
	$('#submit').click(function() {
		return validateEntry();
	});

	$('#book').click(function(){
		showInput();
	});

	$('#end-date').change(function () {
		let rooms = [];

		rooms.push($('#room-id').text());

		$('.connected-rooms').each(function () {
			rooms.push($(this).text());
		})

        let information = {
			start_date: $('#start-date').val(),
			end_date: $('#end-date').val(),
			rooms: rooms
		}

        $.get('/check-availability', information, function(result) {
            //is available
            if(result) {
				$('#end-date-error').text('');
                $('#book').prop('disabled', false);
            } else {
				$('#end-date-error').text('Room Unavailable for the Inputted Dates');
                $('#book').prop('disabled', true);
            }
        });
    });
});

function showInput () {
	let details = [];
	pushToArray(details, 'Room Type', $('#room_type').val());
	pushToArray(details, 'Room Number', $('#room-number').val());
	pushToArray(details, 'Start Date', $('#start-date').val());
	pushToArray(details, 'End Date', $('#end-date').val());
	pushToArray(details, 'First Name', $('#firstname').val());
	pushToArray(details, 'Last Name', $('#lastname').val());
	pushToArray(details, 'Birthdate', $('#birthdate').val());
	pushToArray(details, 'Address', $('#address').val());
	pushToArray(details, 'Contact No.', $('#contact').val());
	pushToArray(details, 'Company Name', $('#company').val());
	pushToArray(details, 'Occupation', $('#occupation').val());
	let message = details.join('<br>')

	$('#inputted-info').html(message);
	$('#bookModal').modal('show');
}

function pushToArray(array, field, value){
	if(value.trim() != ''){
		array.push(`${field}: ${value}`);
	}
}

function validateEntry () {

	let isValid = true;

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

	if (new Date($('#birthdate').val()) > new Date(todayString)) {
		$('#birthdate-error').text('Birthdate cannot be later than Today');
		isValid = false;
	} else {
		$('#birthdate-error').text('');
	}

	return isValid;
}
