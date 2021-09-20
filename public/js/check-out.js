$(document).ready(function () {
	computeInitialCost();
	computeCharges();
	computeDiscount();
	computeTotal();
	computeBalance();

	//onclick event of the button with an id of 'book'
	$('#book').click(function(){
		if (validateEntry()) {
			showInput();
		}
	});

	// recomputes necessary fields when start date changes
	$('#start-date').change(function () {
		checkAvailability();
		computeInitialCost();
		computeCharges();
		computeDiscount();
		computeTotal();
		computeBalance();
    });

	// recomputes necessary fields when end date changes
	$('#end-date').change(function () {
		checkAvailability();
		computeInitialCost();
		computeCharges();
		computeDiscount();
		computeTotal();
		computeBalance();
    });

	// recomputes necessary fields when PWD discount is applied
	$('#is-pwd').change(function () {
		enablePWD();
		computeDiscount();
		computeTotal();
		computeBalance();
	});

	// recomputes necessary fields when senior citizen discount is applied
	$('#is-senior').change(function () {
		enableSenior();
		computeDiscount();
		computeTotal();
		computeBalance();
	});

	// recomputes necessary fields when additional flat discount is applied
	$('#is-discount-php').change(function () {
		enableDiscountPhp();
		computeDiscount();
		computeTotal();
		computeBalance();
	});

	// recomputes necessary fields when additional percent discount is applied
	$('#is-discount-percent').change(function () {
		enableDiscountPercent();
		computeDiscount();
		computeTotal();
		computeBalance();
	});

	// recomputes necessary fields when extra pet charge is applied
	$('#is-extra-pet').change(function () {
		enablePetCharge();
		computeCharges();
		computeDiscount();
		computeTotal();
		computeBalance();
	});

	// recomputes necessary fields when extra bed charge is applied
	$('#is-extra-bed').change(function () {
		enableExtraBedsCharge();
		computeCharges();
		computeDiscount();
		computeTotal();
		computeBalance();
	});

	// recomputes necessary fields based on number of people
	$('#room-pax').change(function () {
		computeInitialCost();
		computeCharges();
		computeDiscount();
		computeTotal();
		computeBalance();
	});

	// recomputes necessary fields when number of senior citizens is changed
	$('#room-senior').change(function () {
		computeDiscount();
		computeTotal();
		computeBalance();
	});

	// recomputes necessary fields when number of PWD is changed
	$('#room-pwd').change(function () {
		computeDiscount();
		computeTotal();
		computeBalance();
	});

	// recomputes necessary fields when additional percent discount is changed
	$('#room-discount-percent').change(function () {
		computeDiscount();
		computeTotal();
		computeBalance();
	});

	// recomputes necessary fields when additional flat discount is changed
	$('#room-discount-php').change(function () {
		computeDiscount();
		computeTotal();
		computeBalance();
	});

	// computes the balance when payment is entered
	$('#room-payment').keyup(function () {
		computeBalance();
	});

	// updates necessary fields when reservation is loaded
	$('#reservation_select').change(function () {
		updateForm();
		checkAvailability();
		computeInitialCost();
		computeCharges();
		computeDiscount();
		computeTotal();
		computeBalance();
	});

	// recomputes necessary fields when extra pet charge is changed
	$('#extra-pet-cost-php').keyup(function (){
		computeCharges();
		computeDiscount();
		computeTotal();
		computeBalance();
	})

	// recomputes necessary fields when extra bed charge is changed
	$('#extra-bed-count').keyup(function (){
		computeCharges();
		computeDiscount();
		computeTotal();
		computeBalance();
	});

	// recomputes necessary fields when additional charges are added
	$('#add-charge-btn').click(function (){
		createOtherChargesArr();
		computeCharges();
		computeDiscount();
		computeTotal();
		computeBalance();
	})
});

let roomInfo = null;

function getRoomInfo () {

	if (!roomInfo) {
		// retrieves room information
		let roomID = $('#room-id').text();

		jQuery.ajaxSetup({async: false});

		$.get('/room', {roomID: roomID}, function(result) {
			roomInfo = result;
		});

		jQuery.ajaxSetup({async: true});

	}
}

// updates form with appropriate details if confirming existing reservation
function updateForm () {
	let reservationID = $('#reservation_select').val();

	if (reservationID) {
		jQuery.ajaxSetup({async: false});

		// gets reservation detials
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

				// updates form with reservation details
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
		// leaves fields blank when not found
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

// validates fields for other charges module
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

// adds other charges item
function addOther () {
	if(checkOtherError()) {
		let othersContainer = $('#other-list');
		let othersAddContainer = $('#other-add');

		//Retrieved value from other reason input
		let newOtherReasonVal = $('#add-other-reason');
		//Retrieved value from other cost input
		let newOtherCostVal = $('#add-other-cost');

		// creates nodes for other charges
		let newDivOtherContainer = $("<div class='d-flex flex-row border p-3 mb-2 justify-content-between align-items-center other-item'></div>");
		let newDivOtherValuesSection = $("<div class='d-flex flex-column align-items-start justify-content-center other-val'></div>");

		let newOtherReason = $("<h6 class='other-val-reason text-primary'></h6>").text(newOtherReasonVal.val().trim());
		let newOtherCost = $("<h6 class='other-val-cost text-primary mb-0'></h6>").text(Number(newOtherCostVal.val()).toFixed(2) + " PHP");

		let newOtherDeleteButton = $("<button class='btn btn-outline-danger rounded-pill h-50 other-del' type='button' onclick='removeOther(this)'></button>");
		let newDeleteIconSpan = $("<span class='material-icons-outlined delete-other'></span>");
		let newDeleteIconStrong = $("<strong></strong>").text("clear");

		// appends the nodes
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

// removes an other charges item
function removeOther (elem) {
	$(elem).parent().remove();

	// recomputes necessary fields
	createOtherChargesArr();
	computeCharges();
	computeDiscount();
	computeTotal();
	computeBalance();
}

// computes room cost based on room rate and duration
function computeInitialCost () {
	getRoomInfo();

	if (roomInfo) {
		let time =  1000 * 60 * 60 * 24;
		let startDate = new Date($('#start-date').val()).getTime();
		let endDate = new Date($('#end-date').val()).getTime();

		if (startDate && endDate && endDate - startDate >= 0) {

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
			let pax = Number($('#room-pax').val());

			// uses the monthly rate if it exists and the duration is at least 30 days
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

			// uses the weekly rate if it exists and the duration is at least 7 days
			if (remaining >= 7 && roomInfo.room_rate.weekly) {
				weeklyRate = roomInfo.room_rate.weekly;
				weeks = remaining / 7;
				remaining = remaining - remaining;
			}

			// uses the daily rate if it exists and the duration is at least 1 day
			if (remaining >= 1 && roomInfo.room_rate.daily) {
				dailyRate = roomInfo.room_rate.daily;
				days = remaining;
				remaining = remaining - remaining;
			}

			// sums the calculated costs
			let total = monthlyRate * months + weeklyRate * weeks + dailyRate * days;
			
			// calculates the final daily rate
			let rate = total / duration;

			// sets values to appropriate fields on form
			$('#duration').val(duration);
			$('#room-initial-cost').val(total.toFixed(2));
			$('#room-rate').val(rate.toFixed(2));
		} else {
			// set fields to 0.00 when duration is 0 or less
			$('#duration').val(0);
			$('#room-initial-cost').val((0).toFixed(2));
			$('#room-rate').val((0).toFixed(2));
		}
	}
}

// computes the cost associated with exceeding the pax limit
function computeExtraPax (pax, maxPax) {
	let extraPaxCost = 0;
	
	// if pax limit is exceeded
	if(pax > maxPax && !isNaN(pax)){
		let rate = 400;
		nExtraPax = pax - maxPax;
		extraPaxCost = nExtraPax * rate;
		$('#extra-pax-count').val(nExtraPax);
		$('#extra-pax-cost-php').val(extraPaxCost.toFixed(2));
	} else {
		// if within pax limit
        $('#extra-pax-count').val('');
        $('#extra-pax-cost-php').val('');
	}
}

// sums the charges in the other charges module
function sumOtherCharges (){
	let sum = 0;
	$('.other-val-cost').each(function (){
		sum += parseFloat($(this).text());
	});
	return sum;
}

// retrieves the details of each other charges item and places them into an object array
function createOtherChargesArr (){
	let arr = [];
	$('.other-item').each(function (){
		temp = {
			reason: $(this).children('.other-val').children('.other-val-reason').text(),
			amount: parseFloat($(this).children('.other-val').children('.other-val-cost').text())
		};
		arr.push(temp);
	});

	$('#other-charges-arr').val(JSON.stringify(arr));
}

// computes additional charges and displays them on the form
function computeCharges () {
	// gets room details
	getRoomInfo();

	if (roomInfo) {
		let total = Number($('#room-initial-cost').val());
		let duration = Number($('#duration').val());
		let pax = Number($('#room-pax').val());
		let extra = 0;
		let extraBed = Number($('#extra-bed-count').val());
		let extraPet = Number($('#extra-pet-cost-php').val());
		let extraOther = sumOtherCharges();

		computeExtraPax(Number($('#room-pax').val()), roomInfo.max_pax);

		// checks if the extra charges have inputs before summing them together
		if(!isNaN(extraBed)) {
			let cost = extraBed * 400;
			extra += cost;
			$('#extra-bed-cost-php').val(cost.toFixed(2));
		}
		if(!isNaN(extraPet))
			extra += extraPet;
		if(!isNaN(extraOther))
			extra += extraOther;

		if (total) {
			let charges = 0;

			//the max pax is set to the room max pax by default
			let roomMaxPax = roomInfo.max_pax;

			//determine if monthly max pax is applicable
			if (!Number.isNaN(duration) && duration >= 30 && roomInfo.room_rate.monthly[0] && !Number.isNaN(pax) && pax > 0) {
				roomMaxPax = roomInfo.room_rate.monthly.length;
			}

			// compute for the charges for extra pax if the inputted max is greater than the specified max pax for the room
			if (!Number.isNaN(pax) && pax > roomMaxPax) {
				charges = charges + (pax - roomMaxPax) * 400;
			}

			//compute early checkin charges
			let today = new Date();
			//checkin time is from 4am to 2pm [4am, 2pm)
			if (today.getHours() >= 12) {
				charges = charges + 0.05 * (today.getHours() - 12 + 1) * roomInfo.room_rate.daily;
			}

			//add the inputted extra charge to the total charges
			if (extra) {
				charges = charges + extra;
			}

			$('#room-total-extra').val(charges.toFixed(2));
		} else {
			$('#room-total-extra').val((0).toFixed(2));
		}
	}
}

// enables/disables senior discount field depending on checkbox
function enableSenior () {
	let senior = $('#is-senior').is(':checked');
	$('#room-senior').prop('readonly', !senior);

	if (!senior) {
		$('#room-senior').val('');
	}
}

// enables/disables PWD discount field depending on checkbox
function enablePWD () {
	let pwd = $('#is-pwd').is(':checked');
	$('#room-pwd').prop('readonly', !pwd);

	if (!pwd) {
		$('#room-pwd').val('');
	}
}

// enables/disables flat discount fields depending on checkbox
function enableDiscountPhp () {
	let discountPhp = $('#is-discount-php').is(':checked');
	$('#room-discount-reason-php').prop('readonly', !discountPhp);
	$('#room-discount-php').prop('readonly', !discountPhp);

	if (!discountPhp) {
		$('#room-discount-reason-php').val('');
		$('#room-discount-php').val('');
	}

}

// enables/disables percent discount fields depending on checkbox
function enableDiscountPercent () {
	let discountPercent = $('#is-discount-percent').is(':checked');
	$('#room-discount-reason-percent').prop('readonly', !discountPercent);
	$('#room-discount-percent').prop('readonly', !discountPercent);

	if (!discountPercent) {
		$('#room-discount-reason-percent').val('');
		$('#room-discount-percent').val('');
	}
}

// enables/disables pet charge field depending on checkbox
function enablePetCharge () {
	let pet = $('#is-extra-pet').is(':checked');
	$('#extra-pet-cost-php').prop('readonly', !pet);

	if (!pet) {
		$('#extra-pet-cost-php').val('');
	}
}

// enables/disables extra bed charge fields depending on checkbox
function enableExtraBedsCharge () {
	let extraBed = $('#is-extra-bed').is(':checked');
	$('#extra-bed-count').prop('readonly', !extraBed);

	if (!extraBed) {
		$('#extra-bed-count').val('');
		$('#extra-bed-cost-php').val('');
	}

}

// computes the applicable discounts and selects the largest one
function computeDiscount () {

	getRoomInfo();

	if (roomInfo) {
		let total = Number($('#room-initial-cost').val());
		let charges = Number($('#room-total-extra').val());
		let senior = Number($('#room-senior').val());
		let pwd = Number($('#room-pwd').val());
		let additionalPhp = Number($('#room-discount-php').val());
		let additionalPercent = Number($('#room-discount-percent').val());
		let duration = Number($('#duration').val());
		let pax = Number($('#room-pax').val());
		let petCharge = Number($('#extra-pet-cost-php').val());

		if (total) {
			// count the number of PWD/seniors
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
					seniorPwdDiscount = seniorPwdPercent / 100 * (totalCost - petCharge);
				} else {
					let seniorPwdPercent =  count / pax * 20;
					seniorPwdDiscount = seniorPwdPercent / 100 *(totalCost - petCharge);
				}
			}

			// compute the additional percent discount
			let additionalPercentDiscount = 0;
			if (additionalPercent) {
				additionalPercentDiscount = additionalPercent / 100 * total;
			}

			let additionalPhpDiscount = 0;
			if (additionalPhp) {
				additionalPhpDiscount = additionalPhp;
			}

			// select the largest discount
			let discount = Math.max(seniorPwdDiscount, additionalPercentDiscount, additionalPhpDiscount);

			$('#room-subtract').val(discount.toFixed(2));
		} else {
			$('#room-subtract').val((0).toFixed(2));
		}
	}
}

// computes the net cost
function computeTotal () {
	let total = Number($('#room-initial-cost').val());
	let charges = Number($('#room-total-extra').val());
	let discount = Number($('#room-subtract').val());

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

// computes the balance after payment
function computeBalance () {
	let net = Number($('#room-net-cost').val());
	let payment = Number($('#room-payment').val());

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

// checks if the booking has no conflicts in the specified date range
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

		$.get('/checkin/room/availability', query, function(result) {
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

	// room information
	pushToArray(detailsLeft, 'Room Type', $('#room_type').val());
	pushToArray(detailsLeft, 'Room Number', $('#room-number').val());
	pushToArray(detailsLeft, 'Start Date', $('#start-date').val());
	pushToArray(detailsLeft, 'End Date', $('#end-date').val());

	//  guest information
	pushToArray(detailsMiddle, 'First Name', $('#firstname').val());
	pushToArray(detailsMiddle, 'Last Name', $('#lastname').val());
	pushToArray(detailsMiddle, 'Birthdate', $('#birthdate').val());
	pushToArray(detailsMiddle, 'Address', $('#address').val());
	pushToArray(detailsMiddle, 'Contact No.', $('#contact').val());
	pushToArray(detailsMiddle, 'Company Name', $('#company').val());
	pushToArray(detailsMiddle, 'Occupation', $('#occupation').val());

	// transaction information
	pushToArray(detailsRight, 'Number of Guests', $('#room-pax').val());
	pushToArray(detailsRight, 'Total Discount', $('#room-subtract').val());
	pushToArray(detailsRight, 'Extra Charges', $('#room-total-extra').val());
	pushToArray(detailsRight, 'Total Cost', $('#room-net-cost').val());
	pushToArray(detailsRight, 'Customer Payment', $('#room-payment').val());
	pushToArray(detailsRight, 'Customer Balance', $('#room-balance').val());

	// join the strings together
	let messageLeft = detailsLeft.join('');
	let messageMiddle = detailsMiddle.join('');
	let messageRight = detailsRight.join('');

	// set the messages in the appropriate modal fields before showing
	$('#input-col-1').html(messageLeft);
	$('#input-col-2').html(messageMiddle);
	$('#input-col-3').html(messageRight);
	$('#bookModal').modal('show');
}

// formats the details before pushing into an array
function pushToArray(array, field, value){
	if(value.trim() != ''){
		array.push(`
		<h4>${field}:</h4>
		<h5 class="ms-4 text-secondary reservation-field">${value}</h5>
		`);
	}
}

// validates input in the fields
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
		} else if (Number($('#room-pax').val()) <= 0) {
		    $('#room-pax-error').text('Number of Guests must be at least 1');
		    isValid = false;
		} else if ($('#duration').val() != '' && Number($('#duration').val()) >= 30 && roomInfo.room_rate.monthly[0] && Number($('#room-pax').val()) > roomInfo.room_rate.monthly.length) {
		    $('#room-pax-error').text(`Number of Guests cannot exeeed ${roomInfo.room_rate.monthly.length} for Monthly Bookings`);
		    isValid = false;
		} else {
		    $('#room-pax-error').text('');
		}

		if ($('#room-payment').val() == '') {
			$('#room-payment-error').text('Customer Payment cannot be empty');
			isValid = false;
		} else if ($('#room-net-cost').val() != '' && Number($('#room-net-cost').val()) - Number($('#room-payment').val()) > 0) {
			$('#room-payment-error').text('Customer Payment cannot be less than the Total Cost');
			isValid = false;
		} else {
			$('#room-payment-error').text('');
		}

		if ( $('#room-pax').val() != '' && $('#room-pwd').val() != ''&& $('#room-senior').val() != '' && Number($('#room-pwd').val()) + Number($('#room-senior').val()) > Number($('#room-pax').val()) ) {
			$('#room-pwd-error').text('Number of PWD and Senior Citizens cannot exceed the Number of Guests');
			isValid  = false;
		} else if ( $('#room-pax').val() != '' && $('#room-pwd').val() != '' && Number($('#room-pwd').val()) > Number($('#room-pax').val()) ) {
			$('#room-pwd-error').text('Number of PWD cannot exceed the Number of Guests');
			isValid  = false;
		} else {
			$('#room-pwd-error').text('');
		}

		if ( $('#room-pax').val() != '' && $('#room-pwd').val() != ''&& $('#room-senior').val() != '' && Number($('#room-pwd').val()) + Number($('#room-senior').val()) > Number($('#room-pax').val()) ) {
			$('#room-senior-error').text('Number of PWD and Senior Citizens cannot exceed the Number of Guests');
			isValid  = false;
		} else if ( $('#room-pax').val() != '' && $('#room-senior').val() != '' && Number($('#room-senior').val()) > Number($('#room-pax').val()) ) {
			$('#room-senior-error').text('Number of Senior Citizens cannot exceed the Number of Guests');
			isValid  = false;
		} else {
			$('#room-senior-error').text('');
		}
	}

	// scrolls to the field with an error closest to the top of the screen
	if(!isValid){
		if($('#firstname-error').text() != ''){
			$('html, body').animate({scrollTop: $('#firstname').offset().top - 118}, 'slow');
		} else if($('#lastname-error').text() != '') {
			$('html, body').animate({scrollTop: $('#lastname').offset().top - 118}, 'slow');
		} else if($('#start-date-error').text() != '') {
			$('html, body').animate({scrollTop: $('#start-date').offset().top - 118}, 'slow');
		} else if($('#end-date-error').text() != '') {
			$('html, body').animate({scrollTop: $('#end-date').offset().top - 118}, 'slow');
		} else if($('#birthdate-error').text() != '') {
			$('html, body').animate({scrollTop: $('#birthdate').offset().top - 118}, 'slow');
		} else if($('#contact-error').text() != '') {
			$('html, body').animate({scrollTop: $('#contact').offset().top - 118}, 'slow');
		}
	}

	return isValid;
}
