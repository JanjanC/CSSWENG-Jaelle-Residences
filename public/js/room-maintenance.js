$(document).ready(function () {
	//update the color of the housekeeping and repair tab depending on the current maintenance status
	updateHousekeepingRow();
	updateRepairRow();

	//shows the input of the user through a modal
	$('#maintenance').click(function() {
		showInput();
	});

	//update the color of the housekeeping tab
	$('#housekeeping-select').change(function() {
		updateHousekeepingRow();
	});

	//update the color of the repair tab
	$('#repair-select').change(function() {
		updateRepairRow();
	});
});

//shows the input of the user through a modal
function showInput () {
	let housekeeping = $('#housekeeping-select option:selected').text();
	let repair = $('#repair-select option:selected').text();

	//retrieves the selected maintenance status of the user
	$('#housekeeping-status').text(housekeeping);
	$('#repair-status').text(repair);

	//display the modal indicating the selected status of the user
	$('#maintenanceModal').modal('show');
}

//update the color of the housekeeping tab depending on the current selected status
function updateHousekeepingRow () {
	let housekeeping = $('#housekeeping-select').val();

	//housekeeping for the room is currently required
	if (housekeeping == 'true') {
		$('#housekeeping-row').addClass('required');
		$('#housekeeping-row').removeClass('not-required');
		//housekeeping for the room is currently NOT required
	} else {
		$('#housekeeping-row').addClass('not-required');
		$('#housekeeping-row').removeClass('required');
	}
}

//update the color of the repair tab depending on the current selected status
function updateRepairRow () {
	let repair = $('#repair-select').val();

	//repair for the room is currently required
	if (repair == 'true') {
		$('#repair-row').addClass('required');
		$('#repair-row').removeClass('not-required');
		//repair for the room is currently NOT required
	} else {
		$('#repair-row').addClass('not-required');
		$('#repair-row').removeClass('required');
	}
}
