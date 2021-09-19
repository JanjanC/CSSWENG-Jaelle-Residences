$(document).ready(function () {
	computeInitialCost();
	computeCharges();
	computeDiscount();
	computeTotal();
	computeBalance();

	//onclick event of the button with an id of 'submit'
	$('#book').click(function(){
		if (validateEntry()) {
			showInput();
		}
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

	$('#is-extra-pet').change(function () {
		enablePetCharge();
		computeCharges();
		computeDiscount();
		computeTotal();
		computeBalance();
	});

	$('#is-extra-bed').change(function () {
		enableExtraBedsCharge();
		computeCharges();
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

	$('#extra-pet-cost-php').keyup(function (){
		computeCharges();
		computeDiscount();
		computeTotal();
		computeBalance();
	});

	$('#extra-bed-count').keyup(function (){
		computeCharges();
		computeDiscount();
		computeTotal();
		computeBalance();
	});

	$('#add-charge-btn').click(function (){
		createOtherChargesArr();
		computeCharges();
		computeDiscount();
		computeTotal();
		computeBalance();
	});

	$('#reservation_select').change(function () {
		updateForm();
		checkAvailability();
		computeInitialCost();
	});

	$('#form-submit').submit(function () {
		submitForm();
	});
});

let roomInfo = null;

function getRoomInfo () {

	if (!roomInfo) {

		let roomID = $('#room-id').text();

		jQuery.ajaxSetup({async: false});

		$.get('/room', {roomID: roomID}, function(result) {
			roomInfo = result;
		});

		jQuery.ajaxSetup({async: true});

	}
}

function submitForm () {
	if ($('#reservation_select').val()) {
		$('#form-submit').attr('action', `/booking/${$('#room-id').text()}/confirm`);
	}
	return true;
}

function updateForm () {
	let reservationID = $('#reservation_select').val();

	if (reservationID) {
		jQuery.ajaxSetup({async: false});

		$.get('/reservation', {reservationID: reservationID}, function(result) {
			if (result) {
				let startDate = '';
				if (result.startDate) {
					startDate = new Date(result.startDate);
					startDate = `${startDate.getFullYear().toString()}-${(startDate.getMonth() + 1).toString().padStart(2, 0)}-${startDate.getDate().toString().padStart(2, 0)}`;
				}

				let endDate = '';
				if (result.endDate) {
					endDate = new Date(result.endDate);
					endDate = `${endDate.getFullYear().toString()}-${(endDate.getMonth() + 1).toString().padStart(2, 0)}-${endDate.getDate().toString().padStart(2, 0)}`;
				}

				let birthdate = '';
				if (result.guest.birthdate) {
					birthdate = new Date(result.guest.birthdate);
					birthdate = `${birthdate.getFullYear().toString()}-${(birthdate.getMonth() + 1).toString().padStart(2, 0)}-${birthdate.getDate().toString().padStart(2, 0)}`;
				}

				$('#start-date').val(startDate);
				$('#end-date').val(endDate);
				$('#firstname').val(result.guest.firstName);
				$('#lastname').val(result.guest.lastName);
				$('#birthdate').val(birthdate);
				$('#address').val(result.guest.address);
				$('#contact').val(result.guest.contact);
				$('#company').val(result.guest.company);
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

function checkOtherError() {
	let costFlag, reasonFlag;
	if($('#add-other-cost').val() != ''){
		costFlag = true;
		$('#add_other_cost_error').text('');
	}
	else{
		costFlag = false;
		$('#add_other_cost_error').text('Please input a number.');
	}

	if($('#add-other-reason').val() !=''){
		reasonFlag = true;
		$('#add_other_reason_error').text('');
	}
	else{
		reasonFlag = false;
		$('#add_other_reason_error').text('Please input a reason.');
	}
	return costFlag && reasonFlag;
}

function addOther () {
	if(checkOtherError()) {
		let othersContainer = $('#other-list');
		let othersAddContainer = $('#other-add');

		//Retrieved value from other reason input
		let newOtherReasonVal = $('#add-other-reason');
		//Retrieved value from other cost input
		let newOtherCostVal = $('#add-other-cost');

		let newDivOtherContainer = $("<div class='d-flex flex-row border p-3 mb-2 justify-content-between align-items-center other-item'></div>");
		let newDivOtherValuesSection = $("<div class='d-flex flex-column align-items-start justify-content-center other-val'></div>");

		let newOtherReason = $("<h6 class='other-val-reason text-primary'></h6>").text(newOtherReasonVal.val().trim());
		let newOtherCost = $("<h6 class='other-val-cost text-primary mb-0'></h6>").text(Number(newOtherCostVal.val()).toFixed(2) + " PHP");

		let newOtherDeleteButton = $("<button class='btn btn-outline-danger rounded-pill h-50 other-del' type='button' onclick='removeOther(this)'></button>");
		let newDeleteIconSpan = $("<span class='material-icons-outlined delete-other'></span>");
		let newDeleteIconStrong = $("<strong></strong>").text("clear");

		newOtherDeleteButton.append(newDeleteIconSpan.append(newDeleteIconStrong));
		newDivOtherValuesSection.append(newOtherReason, newOtherCost);
		newDivOtherContainer.append(newDivOtherValuesSection, newOtherDeleteButton);
		othersAddContainer.before(newDivOtherContainer);

		//Clear values
		newOtherReasonVal.val('');
		newOtherCostVal.val('');
		$("#add_other_cost_error").text('');
		$("#add_other_reason_error").text('');
	}
}

function removeOther (elem) {
	$(elem).parent().remove();
	createOtherChargesArr();
	computeCharges();
	computeDiscount();
	computeTotal();
	computeBalance();
}

function computeInitialCost () {
	getRoomInfo();

	if (roomInfo) {
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

			if (remaining >= 30 && roomInfo.room_rate.monthly[0]) {
				if (Number.isNaN(pax) || pax <= 0) {
					pax = 1;
				}

				if (pax > roomInfo.room_rate.monthly.length) {
					pax = roomInfo.room_rate.monthly.length;
				}

				monthlyRate = roomInfo.room_rate.monthly[pax - 1];
				months = Math.floor(remaining / 30);
				remaining = remaining % 30;
			}

			if (remaining >= 7 && roomInfo.room_rate.weekly) {
				weeklyRate = roomInfo.room_rate.weekly;
				weeks = remaining / 7;
				remaining = remaining - remaining;
			}

			if (remaining >= 1 && roomInfo.room_rate.daily) {
				dailyRate = roomInfo.room_rate.daily;
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
			$('#room-initial-cost').val((0).toFixed(2));
			$('#room-rate').val((0).toFixed(2));
		}
	}
}

function computeExtraPax (pax, maxPax) {
	let extraPaxCost = 0;
	console.log("computeExtraPax " + pax + " " + maxPax);
	if(pax > maxPax && !isNaN(pax)){
		// TODO: input rate
		let rate = 400;
		nExtraPax = pax - maxPax;
		extraPaxCost = nExtraPax * rate;
		$('#extra-pax-count').val(nExtraPax);
		$('#extra-pax-cost-php').val(extraPaxCost);
		console.log("computeExtraPax " + extraPaxCost + " " + nExtraPax);
	} else {
		$('#extra-pax-count').val('');
        $('#extra-pax-cost-php').val('');
	}
}

// function addOtherCharge () {
// 	let reason = $('#add-other-reason').val();
// 	let price = $('#add-other-cost').val();
// 	if(price != null){
// 		let item = `
// 		<div class="d-flex flex-column align-items-start justify-content-center border p-3 mb-2 other-charge-cost-item">
// 		<h6 id="item-reason" class="text-primary"><span class="other-charge-cost-reason">${reason}</span></h6>
// 		<h6 id="item-price" class="text-primary mb-0"><span class="other-charge-cost-price">${price}</span> <span>Php</span></h6>
// 		</div>
// 		`;

// 		$('#add-other-reason').val('');
// 		$('#add-other-cost').val('');
// 		$('#other-list').prepend(item);
// 	}
// }

function sumOtherCharges (){
	let sum = 0;
	$('.other-val-cost').each(function (){
		sum += parseFloat($(this).text());
	});
	console.log(sum);
	return sum;
}

function createOtherChargesArr (){
	let arr = [];
	$('.other-item').each(function (){
		temp = {
			reason: $(this).children('.other-val').children('.other-val-reason').text(),
			amount: parseFloat($(this).children('.other-val').children('.other-val-cost').text())
		};
		arr.push(temp);
	});
	console.log(arr);
	$('#other-charges-arr').val(JSON.stringify(arr));
}

function computeCharges () {

	getRoomInfo();

	if (roomInfo) {
		let total = parseFloat($('#room-initial-cost').val());
		let duration = parseInt($('#duration').val());
		let pax = parseInt($('#room-pax').val());
		let extra = 0;
		let extraBed = parseInt($('#extra-bed-count').val());
		let extraPet = parseInt($('#extra-pet-cost-php').val());
		let extraOther = sumOtherCharges();

		computeExtraPax(parseInt($('#room-pax').val()), roomInfo.max_pax);

		if(!isNaN(extraBed)) {
			let cost = extraBed * 400;
			extra += cost;
			$('#extra-bed-cost-php').val(cost.toFixed(2));
		}
		if(!isNaN(extraPet))
		extra += extraPet;
		if(!isNaN(extraOther))
		extra += extraOther;

		console.log("computeCharges " + total + " " + pax + " " + extra);

		if (total) {
			let charges = 0;

			//the max pax is set to the room max pax by default
			let roomMaxPax = roomInfo.max_pax;

			//determine if monthly max pax is applicable
			if (!Number.isNaN(duration) && duration >= 30 && roomInfo.room_rate.monthly[0] && !Number.isNaN(pax) && pax > 0) {
				roomMaxPax = roomInfo.room_rate.monthly.length;
			}

			if (!Number.isNaN(pax) && pax > roomMaxPax) {
				charges = charges + (pax - roomMaxPax) * 400;
			}

			if (extra) {
				charges = charges + extra;
			}

			$('#room-total-extra').val(charges.toFixed(2));
		} else {
			$('#room-total-extra').val((0).toFixed(2));
		}
	}
}

function enableSenior () {
	let senior = $('#is-senior').is(':checked');
	$('#room-senior').prop('readonly', !senior);

	if (!senior) {
		$('#room-senior').val('');
	}
}

function enablePWD () {
	let pwd = $('#is-pwd').is(':checked');
	$('#room-pwd').prop('readonly', !pwd);

	if (!pwd) {
		$('#room-pwd').val('');
	}
}

function enableDiscountPhp () {
	let discountPhp = $('#is-discount-php').is(':checked');
	$('#room-discount-reason-php').prop('readonly', !discountPhp);
	$('#room-discount-php').prop('readonly', !discountPhp);

	if (!discountPhp) {
		$('#room-discount-reason-php').val('');
		$('#room-discount-php').val('');
	}

}

function enableDiscountPercent () {
	let discountPercent = $('#is-discount-percent').is(':checked');
	$('#room-discount-reason-percent').prop('readonly', !discountPercent);
	$('#room-discount-percent').prop('readonly', !discountPercent);

	if (!discountPercent) {
		$('#room-discount-reason-percent').val('');
		$('#room-discount-percent').val('');
	}
}

function enablePetCharge () {
	let pet = $('#is-extra-pet').is(':checked');
	$('#extra-pet-cost-php').prop('readonly', !pet);

	if (!pet) {
		$('#extra-pet-cost-php').val('');
	}
}

function enableExtraBedsCharge () {
	let extraBed = $('#is-extra-bed').is(':checked');
	$('#extra-bed-count').prop('readonly', !extraBed);

	if (!extraBed) {
		$('#extra-bed-count').val('');
		$('#extra-bed-cost-php').val('');
	}

}

function computeDiscount () {

	getRoomInfo();

	if (roomInfo) {
		let total = parseFloat($('#room-initial-cost').val());
		let charges = parseFloat($('#room-total-extra').val());
		let senior = parseInt($('#room-senior').val());
		let pwd = parseInt($('#room-pwd').val());
		let additionalPhp = parseFloat($('#room-discount-php').val());
		let additionalPercent = parseFloat($('#room-discount-percent').val());
		let duration = parseInt($('#duration').val());
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
			let totalCost = total;
			if (charges) {
				totalCost = totalCost + charges;
			}

			if (!Number.isNaN(pax) && pax > 0) {
				//number of senior and pwd is greater than max pax for the room
				if (count > pax) {
					let seniorPwdPercent =  20;
					seniorPwdDiscount = seniorPwdPercent / 100 * totalCost;
				} else {
					let seniorPwdPercent =  count / pax * 20;
					seniorPwdDiscount = seniorPwdPercent / 100 * totalCost;
				}
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
			$('#room-subtract').val((0).toFixed(2));
		}
	}
}

function computeTotal () {
	let total = parseFloat($('#room-initial-cost').val());
	let charges = parseFloat($('#room-total-extra').val());
	let discount = parseFloat($('#room-subtract').val());

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
		$('#room-net-cost').val((0).toFixed(2));
	}

}

function computeBalance () {
	let net = parseFloat($('#room-net-cost').val());
	let payment = parseFloat($('#room-payment').val());

	if (net) {

		let balance = payment;
		if (payment) {
			balance =  net - payment;
		}

		$('#room-balance').val(balance.toFixed(2));
	} else {
		$('#room-balance').val((0).toFixed(2));
	}
}

function checkAvailability () {
	let startDate = $('#start-date').val();
	let endDate = $('#end-date').val();
	let bookingID = $('#booking-id').text();
	let roomID = $('#room-id').text();

	if (startDate && endDate && endDate >= startDate) {

		let query = {
			startDate: startDate,
			endDate: endDate,
			roomID: roomID,
			bookingID: bookingID
		}

		$.get('/booking/room/availability', query, function(result) {
			//is available
			if(result) {
				$('#end-date-error').text('');
				$('#book').prop('disabled', false);
			} else {
				$('#end-date-error').text('Room Unavailable for the Inputted Dates');
				$('#book').prop('disabled', true);
			}
		});
	} else {
		$('#end-date-error').text('');
		$('#book').prop('disabled', false);
	}
}

function showInput () {
	let detailsLeft = [];
	let detailsMiddle = [];
	let detailsRight = [];
	pushToArray(detailsLeft, 'Room Type', $('#room_type').val());
	pushToArray(detailsLeft, 'Room Number', $('#room-number').val());
	pushToArray(detailsLeft, 'Start Date', $('#start-date').val());
	pushToArray(detailsLeft, 'End Date', $('#end-date').val());
	pushToArray(detailsMiddle, 'First Name', $('#firstname').val());
	pushToArray(detailsMiddle, 'Last Name', $('#lastname').val());
	pushToArray(detailsMiddle, 'Birthdate', $('#birthdate').val());
	pushToArray(detailsMiddle, 'Address', $('#address').val());
	pushToArray(detailsMiddle, 'Contact No.', $('#contact').val());
	pushToArray(detailsMiddle, 'Company Name', $('#company').val());
	pushToArray(detailsMiddle, 'Occupation', $('#occupation').val());
	pushToArray(detailsRight, 'Number of Guests', $('#room-pax').val());
	// pushToArray(detailsRight, 'Number of PWD', $('#room-pwd').val());
	// pushToArray(detailsRight, 'Number of Senior Citizens', $('#room-senior').val());
	// pushToArray(detailsRight, 'Other Discounts (Flat)', $('#room-discount-php').val());
	// pushToArray(detailsRight, 'Other Discounts (%)', $('#room-discount-percent').val());
	pushToArray(detailsRight, 'Total Discount', $('#room-subtract').val());
	pushToArray(detailsRight, 'Extra Charges', $('#room-total-extra').val());
	pushToArray(detailsRight, 'Total Cost', $('#room-net-cost').val());
	pushToArray(detailsRight, 'Customer Payment', $('#room-payment').val());
	pushToArray(detailsRight, 'Customer Balance', $('#room-balance').val());
	let messageLeft = detailsLeft.join('');
	let messageMiddle = detailsMiddle.join('');
	let messageRight = detailsRight.join('');

	$('#input-col-1').html(messageLeft);
	$('#input-col-2').html(messageMiddle);
	$('#input-col-3').html(messageRight);
	$('#bookModal').modal('show');
}

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

	//get the date today in the format of YYYY-MM-DD
	let today = new Date();
	let todayString = `${today.getFullYear().toString()}-${(today.getMonth() + 1).toString().padStart(2, 0)}-${today.getDate().toString().padStart(2, 0)}`;
	let fiveYearString = `${(today.getFullYear() + 5).toString()}-${(today.getMonth() + 1).toString().padStart(2, 0)}-${today.getDate().toString().padStart(2, 0)}`;

	getRoomInfo();

	if (roomInfo) {
		//the start date input field is empty
		if ($('#start-date').val() == '') {
			$('#start-date-error').text('Start Date cannot be empty');
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
		    $('#room-pax-error').text('Number of Guests cannot be empty');
		    isValid = false;
		} else if (parseInt($('#room-pax').val()) <= 0) {
		    $('#room-pax-error').text('Number of Guests must be at least 1');
		    isValid = false;
		} else if ($('#duration').val() != '' && parseInt($('#duration').val()) >= 30 && roomInfo.room_rate.monthly[0] && parseInt($('#room-pax').val()) > roomInfo.room_rate.monthly.length) {
		    $('#room-pax-error').text(`Number of Guests cannot exeeed ${roomInfo.room_rate.monthly.length} for Monthly Bookings`);
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
			$('#room-pwd-error').text('Number of PWD and Senior Citizens cannot exceed the Number of Guests');
			isValid  = false;
		} else if ( $('#room-pax').val() != '' && $('#room-pwd').val() != '' && parseInt($('#room-pwd').val()) > parseInt($('#room-pax').val()) ) {
			$('#room-pwd-error').text('Number of PWD cannot exceed the Number of Guests');
			isValid  = false;
		} else {
			$('#room-pwd-error').text('');
		}

		if ( $('#room-pax').val() != '' && $('#room-pwd').val() != ''&& $('#room-senior').val() != '' && parseInt($('#room-pwd').val()) + parseInt($('#room-senior').val()) > parseInt($('#room-pax').val()) ) {
			$('#room-senior-error').text('Number of PWD and Senior Citizens cannot exceed the Number of Guests');
			isValid  = false;
		} else if ( $('#room-pax').val() != '' && $('#room-senior').val() != '' && parseInt($('#room-senior').val()) > parseInt($('#room-pax').val()) ) {
			$('#room-senior-error').text('Number of Senior Citizens cannot exceed the Number of Guests');
			isValid  = false;
		} else {
			$('#room-senior-error').text('');
		}
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
