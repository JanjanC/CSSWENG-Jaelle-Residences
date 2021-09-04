$(document).ready(function () {
	computeInitialCost();
	computeCharges();
	computeDiscount();
	computeTotal();
	computeBalance();

	//onclick event of the button with an id of 'submit'
	$('#submit').click(function() {
		return validateEntry();
	});

	$('#book').click(function(){
		showInput();
	});

	$('#start-date').change(function () {
		checkAvailability();
		computeInitialCost();
		computeCharges();
		computeDiscount();
		computeTotal();
		computeBalance();
    });

	$('#end-date').change(function () {
		checkAvailability();
		computeInitialCost();
		computeCharges();
		computeDiscount();
		computeTotal();
		computeBalance();
    });

	$('#is-pwd').change(function () {
		enablePWD();
		computeDiscount();
		computeTotal();
		computeBalance();
	});

	$('#is-senior').change(function () {
		enableSenior();
		computeDiscount();
		computeTotal();
		computeBalance();
	});

	$('#is-discount-php').change(function () {
		enableDiscountPhp();
		computeDiscount();
		computeTotal();
		computeBalance();
	});

	$('#is-discount-percent').change(function () {
		enableDiscountPercent();
		computeDiscount();
		computeTotal();
		computeBalance();
	});

	$('#room-pax').change(function () {
		computeInitialCost();
		computeCharges();
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

	$('#room-discount-percent').change(function () {
		computeDiscount();
		computeTotal();
		computeBalance();
	});

	$('#room-discount-php').change(function () {
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

	$('#reservation_select').change(function () {
		updateForm();
		checkAvailability();
		computeInitialCost();
		computeCharges();
		computeDiscount();
		computeTotal();
		computeBalance();
	});
});

function updateForm () {
	let reservationID = $('#reservation_select').val();

	if (reservationID) {
		jQuery.ajaxSetup({async: false});

		$.get('/reservation', {reservationID: reservationID}, function(result) {
			if (result) {
				let startDate = '';
				if (result.start_date) {
					startDate = new Date(result.start_date);
					startDate = `${startDate.getFullYear().toString()}-${(startDate.getMonth() + 1).toString().padStart(2, 0)}-${startDate.getDate().toString().padStart(2, 0)}`;
				}

				let endDate = '';
				if (result.end_date) {
					endDate = new Date(result.end_date);
					endDate = `${endDate.getFullYear().toString()}-${(endDate.getMonth() + 1).toString().padStart(2, 0)}-${endDate.getDate().toString().padStart(2, 0)}`;
				}

				let birthdate = '';
				if (result.guest.birthdate) {
					birthdate = new Date(result.guest.birthdate);
					birthdate = `${birthdate.getFullYear().toString()}-${(birthdate.getMonth() + 1).toString().padStart(2, 0)}-${birthdate.getDate().toString().padStart(2, 0)}`;
				}

				$('#start-date').val(startDate);
				$('#end-date').val(endDate);
				$('#firstname').val(result.guest.first_name);
				$('#lastname').val(result.guest.last_name);
				$('#birthdate').val(birthdate);
				$('#address').val(result.guest.address);
				$('#contact').val(result.guest.contact_number);
				$('#company').val(result.guest.company_name);
				$('#occupation').val(result.guest.occupation);
			}
		});

		jQuery.ajaxSetup({async: true});
	} else {
		$('#end-date').val('');
		$('#firstname').val('');
		$('#lastname').val('');
		$('#birthdate').val('');
		$('#address').val('');
		$('#contact').val('');
		$('#company').val('');
		$('#occupation').val('');
	}
}

function computeInitialCost () {
	let roomID = $('#room-id').text();

	jQuery.ajaxSetup({async: false});

	$.get('/room', {roomID: roomID}, function(result) {
		if (result) {
			let time =  1000 * 60 * 60 * 24;
			let startDate = new Date($('#start-date').val()).getTime();
			let endDate = new Date($('#end-date').val()).getTime();

			if (startDate && endDate && endDate - startDate > 0) {

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

				let remaining = duration;
				let pax = parseInt($('#room-pax').val());

				if (remaining >= 30 && result.room_rate.monthly[0]) {
					if (Number.isNaN(pax) || pax <= 0) {
						pax = 1;
					}

					if (pax > result.room_rate.monthly.length) {
						pax = result.room_rate.monthly.length;
					}

					monthlyRate = result.room_rate.monthly[pax - 1];
					months = Math.floor(remaining / 30);
					remaining = remaining % 30;
				}

				if (remaining >= 7 && result.room_rate.weekly) {
					weeklyRate = result.room_rate.weekly;
					weeks = remaining / 7;
					remaining = remaining - remaining;
				}

				if (remaining >= 1 && result.room_rate.daily) {
					dailyRate = result.room_rate.daily;
					days = remaining;
					remaining = remaining - remaining;
				}

				let total = monthlyRate * months + weeklyRate * weeks + dailyRate * days;
				let rate = total / duration;

				$('#duration').val(duration);
				$('#room-initial-cost').val(total.toFixed(2));
				$('#room-rate').val(rate.toFixed(2));
			} else {
				$('#duration').val(0);
				$('#room-initial-cost').val(0.00);
				$('#room-rate').val(0.00);
			}
		}
	});

	jQuery.ajaxSetup({async: true});
}

function computeCharges () {

	let roomID = $('#room-id').text();

	jQuery.ajaxSetup({async: false});

	$.get('/room', {roomID: roomID}, function(result) {
		if (result) {
			let total = parseInt($('#room-initial-cost').val());
			let pax = parseInt($('#room-pax').val());
			let extra = parseInt($('#room-extra').val());

			if (total) {
				let charges = 0;
				if (!Number.isNaN(pax) && pax > result.max_pax) {
					charges = charges + (pax - result.max_pax) * 400;
				}

				if (extra) {
					charges = charges + extra;
				}

				$('#room-total-extra').val(charges);
			} else {
				$('#room-total-extra').val(0.00);
			}
		}
	});

	jQuery.ajaxSetup({async: true});
}

function enableSenior () {
	let senior = $('#is-senior').is(':checked');
	$('#room-senior').prop('disabled', !senior);

	if (!senior) {
		$('#room-senior').val('');
	}
}

function enablePWD () {
	let pwd = $('#is-pwd').is(':checked');
	$('#room-pwd').prop('disabled', !pwd);

	if (!pwd) {
		$('#room-pwd').val('');
	}
}

function enableDiscountPhp () {
	let discountPhp = $('#is-discount-php').is(':checked');
	$('#room-discount-reason-php').prop('disabled', !discountPhp);
	$('#room-discount-php').prop('disabled', !discountPhp);

	if (!discountPhp) {
		$('#room-discount-reason-php').val('');
		$('#room-discount-php').val('');
	}

}

function enableDiscountPercent () {
	let discountPercent = $('#is-discount-percent').is(':checked');
	$('#room-discount-reason-percent').prop('disabled', !discountPercent);
	$('#room-discount-percent').prop('disabled', !discountPercent);

	if (!discountPercent) {
		$('#room-discount-reason-percent').val('');
		$('#room-discount-percent').val('');
	}
}

function computeDiscount () {

	let roomID = $('#room-id').text();

	jQuery.ajaxSetup({async: false});

	$.get('/room', {roomID: roomID}, function(result) {
		if (result) {
			let total = parseInt($('#room-initial-cost').val());
			let senior = parseInt($('#room-senior').val());
			let pwd = parseInt($('#room-pwd').val());
			let additionalPhp = parseInt($('#room-discount-php').val());
			let additionalPercent = parseInt($('#room-discount-percent').val())
			let pax = parseInt($('#room-pax').val());

			if (total) {
				let count = 0
				if (senior) {
					count = count + senior;
				}

				if (pwd) {
					count = count + pwd;
				}

				let seniorPwdDiscount = 0;
				if (count > result.max_pax) {
					let seniorPwdPercent =  20;
					seniorPwdDiscount = seniorPwdPercent / 100 * total;
					seniorPwdDiscount = seniorPwdDiscount + (count - result.max_pax) * 0.20 * 400;
				} else {
					let seniorPwdPercent =  count / result.max_pax * 20;
					seniorPwdDiscount = seniorPwdPercent / 100 * total;
				}

				let additionalPercentDiscount = 0;
				if (additionalPercent) {
					additionalPercentDiscount = additionalPercent / 100 * total;
				}

				let additionalPhpDiscount = 0;
				if (additionalPhp) {
					additionalPhpDiscount = additionalPhp;
				}

				let discount = Math.max(seniorPwdDiscount, additionalPercentDiscount, additionalPhpDiscount);

				$('#room-subtract').val(discount.toFixed(2));
			} else {
				$('#room-subtract').val(0.00);
			}
		}
	});

	jQuery.ajaxSetup({async: true});
}

function computeTotal () {
	let total = parseInt($('#room-initial-cost').val());
	let charges = parseInt($('#room-total-extra').val());
	let discount = parseInt($('#room-subtract').val());

	if (total) {
		let net = total;

		if (charges) {
			net = net + charges;
		}

		if (discount) {
			net = net - discount;
		}

		$('#room-net-cost').val(net.toFixed(2));
	} else {
		$('#room-net-cost').val(0.00);
	}

}

function computeBalance () {
	let net = parseInt($('#room-net-cost').val());
	let payment = parseInt($('#room-payment').val());

	if (net) {

		let balance = payment;
		if (payment) {
			balance =  net - payment;
		}

		$('#room-balance').val(balance.toFixed(2));
	} else {
		$('#room-balance').val(0.00);
	}
}

function checkAvailability () {
	let startDate = $('#start-date').val();
	let endDate = $('#end-date').val();
	let bookingid = $('#booking-id').text();

	if (startDate && endDate && endDate >= startDate) {
		let rooms = [];

		rooms.push($('#room-id').text());

		$('.connected-rooms').each(function () {
			rooms.push($(this).text());
		});

		let information = {
			start_date: startDate,
			end_date: endDate,
			rooms: rooms,
			bookingid: bookingid
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
	} else if (new Date($('#start-date').val()) < new Date(todayString) && !$('#start-date').is('[readonly]')) {
		$('#start-date-error').text('Start Date cannot be earlier than Today');
		isValid = false;
	} else if (new Date($('#start-date').val()) > new Date(fiveYearString) && !$('#start-date').is('[readonly]')) {
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
	} else if ($('#start-date').val() != '' && new Date($('#end-date').val()).getTime() == new Date($('#start-date').val()).getTime()) {
		$('#end-date-error').text('End Date cannot the same as Start Date');
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

	let numberPattern = new RegExp('^(09)\\d{9}$');
	if ($('#contact').val() != '' && !numberPattern.test($('#contact').val())) {
		$('#contact-error').text('Contact Number is invalid');
		isValid = false;
	} else {
		$('#contact-error').text('');
	}

	if ($('#room-pax').val() == '') {
		$('#room-pax-error').text('Number of Guest cannot be empty');
		isValid = false;
	} else if (parseInt($('#room-pax').val()) <= 0) {
		$('#room-pax-error').text('Number of Guest must be at least 1');
		isValid = false;
	} else {
		$('#room-pax-error').text('');
	}

	if ($('#room-payment').val() == '') {
		$('#room-payment-error').text('Customer Payment cannot be empty');
		isValid = false;
	} else if ($('#room-net-cost').val() != '' && parseFloat($('#room-net-cost').val()) - parseFloat($('#room-payment').val()) > 0) {
		$('#room-payment-error').text('Customer Payment cannot be less than the Total Cost');
		isValid = false;
	} else {
		$('#room-payment-error').text('');
	}

	if ( $('#room-pax').val() != '' && $('#room-pwd').val() != ''&& $('#room-senior').val() != '' && parseInt($('#room-pwd').val()) + parseInt($('#room-senior').val()) > parseInt($('#room-pax').val()) ) {
		$('#room-pwd-error').text('Number of PWD and Senior cannot exceed the Number of Guests');
		isValid  = false;
	} else if ( $('#room-pax').val() != '' && $('#room-pwd').val() != '' && parseInt($('#room-pwd').val()) > parseInt($('#room-pax').val()) ) {
		$('#room-pwd-error').text('Number of PWD cannot exceed the Number of Guests');
		isValid  = false;
	} else {
		$('#room-pwd-error').text('');
	}

	if ( $('#room-pax').val() != '' && $('#room-pwd').val() != ''&& $('#room-senior').val() != '' && parseInt($('#room-pwd').val()) + parseInt($('#room-senior').val()) > parseInt($('#room-pax').val()) ) {
		$('#room-senior-error').text('Number of PWD and Senior cannot exceed the Number of Guests');
		isValid  = false;
	} else if ( $('#room-pax').val() != '' && $('#room-senior').val() != '' && parseInt($('#room-senior').val()) > parseInt($('#room-pax').val()) ) {
		$('#room-senior-error').text('Number of Senior cannot exceed the Number of Guests');
		isValid  = false;
	} else {
		$('#room-senior-error').text('');
	}

	if(!isValid){
		if($('#firstname-error').text() != ''){
			$('html, body').animate({scrollTop: $('#firstname').offset().top - 118}, 'slow');
		}
		else if($('#lastname-error').text() != ''){
			$('html, body').animate({scrollTop: $('#lastname').offset().top - 118}, 'slow');
		}
		else if($('#start-date-error').text() != ''){
			$('html, body').animate({scrollTop: $('#start-date').offset().top - 118}, 'slow');
		}
		else if($('#birthdate-error').text() != ''){
			$('html, body').animate({scrollTop: $('#birthdate').offset().top - 118}, 'slow');
		}
		else if($('#contact-error').text() != ''){
			$('html, body').animate({scrollTop: $('#contact').offset().top - 118}, 'slow');
		}
		else if($('#end-date-error').text() != ''){
			$('html, body').animate({scrollTop: $('#end-date').offset().top - 118}, 'slow');
		}
	}

	return isValid;
}
