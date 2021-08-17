$(document).ready(function () {
	initializeCalendar();
});

function initializeCalendar () {
	var today = (new Date()).getDate()

	$('#calendar tr').each(function() {
        for (let i = 0; i < 7; i++) {

        	//skips first row
            if ($(this.cells[i]).text() == 'Sunday') {
            	i = 7
            }

            //adds css for today
            if (parseInt($(this.cells[i]).text()) == today) {
                $(this.cells[i]).addClass('today')
            }

            //adds css for days not part of month
            if($(this.cells[i]).text() == '0') {
                $(this.cells[i]).text('')
                $(this.cells[i]).addClass('not-month')
                $(this.cells[i]).attr("onclick","");
            }

            //adds css for days part of month
            else {
                $(this.cells[i]).addClass('in-month')
            }
        }
    });
}
