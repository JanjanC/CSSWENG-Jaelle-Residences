$(document).ready(function () {
	//set the calendar as the active tab in the view
	$('#nav-calendar').addClass('active');
	//set the style calendar on page load
	initializeCalendar();
});

//set the style of the calendar with the corresponding months, weeks, and days value
function initializeCalendar () {
	const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

	let date = new Date();
	//get the current day of the month today
	let today = date.getDate();
	//get the current month today
	let curMonth = months[date.getMonth()];
	//get the current year today
	let curYear = date.getFullYear();
	
	//get the current month and year on the calendar
	let calendarMonth = $('#cal-month').text();
	let calendarYear =  parseInt($('#cal-year').text());

	console.log("CUR MONTH = " + curMonth);
	console.log("CUR YEAR = " + curYear);
	console.log("CAL MONTH = " + calendarMonth);
	console.log("CAL YEAR = " + calendarYear);

	//set the styles for each of the cell in the calendar
	$('#calendar tr').each(function() {
		for (let i = 0; i < 7; i++) {

			//skips first row in the calendar
			if ($(this.cells[i]).text() == 'Sunday') {
				i = 7
			}

			//adds style for the current date today
			if (parseInt($(this.cells[i]).text()) == today && curMonth == calendarMonth && curYear == calendarYear) {
				$(this.cells[i]).addClass('today')
			}

			//adds styles for the days that NOT part of month
			if($(this.cells[i]).text() == '0') {
				$(this.cells[i]).text('')
				$(this.cells[i]).addClass('not-month')
				$(this.cells[i]).attr("onclick","");
			}

			//adds styles for the day that are part of month
			else {
				$(this.cells[i]).addClass('in-month')
			}
		}
	});
}
