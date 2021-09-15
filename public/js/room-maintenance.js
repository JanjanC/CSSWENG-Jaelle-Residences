$(document).ready(function () {
	$('#maintenance').click(function() {
		showInput();
	});
});

function showInput () {
    let housekeeping = $('#housekeeping-select').val();
    let repair = $('#repair-select').val();

    console.log(housekeeping);

    $('#housekeeping-status').text(housekeeping);
    $('#repair-status').text(repair);

    $('#maintenanceModal').modal('show');
}
