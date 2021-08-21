$(document).ready(function () {
	$('#nav-calendar').addClass('active');
	initializeCalendar();
});

function initializeCalendar () {
	const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

	let date = new Date();
	let today = date.getDate();
	let curMonth = months[date.getMonth()];
	let curYear = date.getFullYear();

	let calendarMonth = $('#cal-month').text();
	let calendarYear =  parseInt($('#cal-year').text());

	console.log("CUR MONTH = " + curMonth);
	console.log("CUR YEAR = " + curYear);
	console.log("CAL MONTH = " + calendarMonth);
	console.log("CAL YEAR = " + calendarYear);

	$('#calendar tr').each(function() {
        for (let i = 0; i < 7; i++) {

        	//skips first row
            if ($(this.cells[i]).text() == 'Sunday') {
            	i = 7
            }

            //adds css for today
            if (parseInt($(this.cells[i]).text()) == today && curMonth == calendarMonth && curYear == calendarYear) {
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
