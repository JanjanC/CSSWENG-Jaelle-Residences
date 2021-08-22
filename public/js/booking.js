$(document).ready(function () {
	//onclick event of the button with an id of 'submit'
	$('#submit').click(function() {
		return validateEntry();
	});

	$('#book').click(function(){
		showInput();
	});

	$('#end-date').change(function () {
		checkAvailability();
		computeRoomPrice();
		computeCharges();
		computeDiscount();
		computeTotal();
		computeBalance();
    });

	$('#is-pwd').change(function () {
		enablePWD();
	});

	$('#is-senior').change(function () {
		enableSenior();
	});

	$('#room-pax').change(function () {
		computeDiscount();
		computeTotal();
		computeBalance();
	});

	$('#room-senior').change(function () {
		computeDiscount();
		computeTotal();
		computeBalance();
	});

	$('#room-pwd').change(function () {
		computeDiscount();
		computeTotal();
		computeBalance();
	});

	$('#room-discount').keyup(function () {
		computeDiscount();
		computeTotal();
		computeBalance();
	});

	$('#room-extra').keyup(function () {
		computeCharges();
		computeDiscount();
		computeTotal();
		computeBalance();
	});

	$('#room-payment').keyup(function () {
		computeBalance();
	});
});

function computeRoomPrice () {
	let roomID = $('#room-id').text();

	jQuery.ajaxSetup({async: false});

	$.get('/room', {roomID: roomID}, function(result) {
		if (result) {
			let time =  1000 * 60 * 60 * 24;
			let startDate = new Date($('#start-date').val()).getTime();
			let endDate = new Date($('#end-date').val()).getTime();
			let duration = Math.round(Math.abs((endDate - startDate) / time));
			let months = 0;
			let weeks = 0;
			let days = 0;

			let monthlyRate = 0;
			let weeklyRate = 0;
			let dailyRate = 0;

			if (duration <= 0) {
				duration = 1;
			}
			$('#duration').val(duration);

			let remaining = duration;
			let pax = parseInt($('#room-pax').val());
			console.log(result);
			if (result.room_rate.monthly) {
				if (Number.isNaN(pax)) {
					pax = 1;
				}

				if (pax > result.room_rate.monthly.length) {
					pax = result.room_rate.monthly.length;
				}
				monthlyRate = result.room_rate.monthly[pax - 1];
				months = Math.floor(remaining / 30);
				remaining = remaining % 30;
			}

			if (result.room_rate.weekly) {
				weeklyRate = result.room_rate.weekly;
				weeks = Math.floor(remaining / 7);
				remaining = remaining % 7;
			}

			if (result.room_rate.daily) {
				dailyRate = result.room_rate.daily;
				days = remaining;
			}

			let total = monthlyRate * months + weeklyRate * weeks + dailyRate * days;
			let rate = total / duration;

			$('#room-initial-cost').val(total.toFixed(2));
			$('#room-rate').val(rate.toFixed(2));
		}
	});

	jQuery.ajaxSetup({async: true});
}

function computeCharges () {
	let total = parseInt($('#room-initial-cost').val());
	let extra = parseInt($('#room-extra').val());

	if (extra) {
		total = total + extra;
	}

	$('#room-initial-cost').val(total.toFixed(2))
}

function enableSenior () {
	let senior = $('#is-senior').is(':checked');
	$('#room-senior').prop('disabled', !senior);
}

function enablePWD () {
	let pwd = $('#is-pwd').is(':checked');
	$('#room-pwd').prop('disabled', !pwd);
}

function computeDiscount () {
	let total = parseInt($('#room-initial-cost').val());
	let senior = parseInt($('#room-senior').val());
	let pwd = parseInt($('#room-pwd').val());
	let additional = parseInt($('#room-discount').val());
	let pax = parseInt($('#room-pax').val());

	let count = 0
	if (senior) {
		count = count + senior;
	}

	if (pwd) {
		count = count + pwd;
	}

	if (count > pax) {
		count = pax;
	}

	let percent = 0;

	if (pax) {
		percent = percent + count / pax * 20;
	}

	if (additional) {
		percent = percent + additional;
	}

	percent = percent / 100;

	let discount = total * percent;

	$('#room-subtract').val(discount.toFixed(2));
}

function computeTotal () {
	let total = parseInt($('#room-initial-cost').val());
	let discount = parseInt($('#room-subtract').val());
	let net = total - discount;

	$('#room-net-cost').val(net.toFixed(2));
}

function computeBalance () {
	let net = parseInt($('#room-net-cost').val());
	let payment = parseInt($('#room-payment').val());
	let balance = payment - net;

	$('#room-balance').val(balance.toFixed(2));
}

function checkAvailability () {
	let rooms = [];

	rooms.push($('#room-id').text());

	$('.connected-rooms').each(function () {
		rooms.push($(this).text());
	});

	let information = {
		start_date: $('#start-date').val(),
		end_date: $('#end-date').val(),
		rooms: rooms
	}

	$.get('/room/availability', information, function(result) {
		//is available
		if(result) {
			$('#end-date-error').text('');
			$('#book').prop('disabled', false);
		} else {
			$('#end-date-error').text('Room Unavailable for the Inputted Dates');
			$('#book').prop('disabled', true);
		}
	});
}

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
