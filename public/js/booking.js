$(document).ready(function () {
	initializeRooms();
});

function initializeRooms () {
	var URL = $("#grid-container").attr ("name");

	$.get ('/rooms', null, function (result) {
		var result = result.rooms;
		while (result.length) {
			var temp = result.shift();

			var roomNumber = temp.room_number;

			$("#grid-container").append(`
				<a href = "#" class="link">
					<div class="room-container">
						<p style="margin:auto">${roomNumber}</p>
					</div>
				</a>`);
		}
	});
}


