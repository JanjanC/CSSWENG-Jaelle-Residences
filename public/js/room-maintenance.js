$(document).ready(function () {
	$('#maintenance').click(function() {
		showInput();
	});
});

function showInput () {
    let housekeeping = $('#housekeeping-select option:selected').text();
    let repair = $('#repair-select option:selected').text();

    $('#housekeeping-status').text(housekeeping);
    $('#repair-status').text(repair);

    $('#maintenanceModal').modal('show');
}
