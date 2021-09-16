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

function showInput () {
    let housekeeping = $('#housekeeping-select option:selected').text();
    let repair = $('#repair-select option:selected').text();

    $('#housekeeping-status').text(housekeeping);
    $('#repair-status').text(repair);

    $('#maintenanceModal').modal('show');
}

function updateHousekeepingRow () {
	let housekeeping = $('#housekeeping-select').val();

	if (housekeeping == 'true') {
		$('#housekeeping-row').addClass('required');
		$('#housekeeping-row').removeClass('okay');
	} else {
		$('#housekeeping-row').addClass('okay');
		$('#housekeeping-row').removeClass('required');
	}
}

function updateRepairRow () {
	let repair = $('#repair-select').val();

	if (repair == 'true') {
		$('#repair-row').addClass('required');
		$('#repair-row').removeClass('okay');
	} else {
		$('#repair-row').addClass('okay');
		$('#repair-row').removeClass('required');
	}
}
