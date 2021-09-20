$(document).ready(function () {
	updateHousekeepingRow();
	updateRepairRow();

	$('#maintenance').click(function() {
		showInput();
	});

	$('#housekeeping-select').change(function() {
		updateHousekeepingRow();
	});

	$('#repair-select').change(function() {
		updateRepairRow();
	});
});

//shows the input of the user
function showInput () {
    let housekeeping = $('#housekeeping-select option:selected').text();
    let repair = $('#repair-select option:selected').text();

    $('#housekeeping-status').text(housekeeping);
    $('#repair-status').text(repair);

    $('#maintenanceModal').modal('show');
}

//update the color of the housekpping tab
function updateHousekeepingRow () {
	let housekeeping = $('#housekeeping-select').val();

	if (housekeeping == 'true') {
		$('#housekeeping-row').addClass('required');
		$('#housekeeping-row').removeClass('not-required');
	} else {
		$('#housekeeping-row').addClass('not-required');
		$('#housekeeping-row').removeClass('required');
	}
}

//update the color of the repair tab
function updateRepairRow () {
	let repair = $('#repair-select').val();

	if (repair == 'true') {
		$('#repair-row').addClass('required');
		$('#repair-row').removeClass('not-required');
	} else {
		$('#repair-row').addClass('not-required');
		$('#repair-row').removeClass('required');
	}
}
