const hbs = require(`hbs`);

//returns the date in the format of MON. DD, YYYY
hbs.registerHelper('beautifyDate', function(date) {
    let month = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"][date.getMonth()];
	let day = date.getDate().toString().padStart(2, 0);
	let year = date.getFullYear().toString();
    return `${month}. ${day}, ${year}`;
});

//returns the date in the format of YYYY-MM-DD
hbs.registerHelper('formatDate', function(date) {
	let year = date.getFullYear().toString();
    let month = (date.getMonth() + 1).toString().padStart(2, 0);
	let day = date.getDate().toString().padStart(2, 0);
    return `${year}-${month}-${day}`;
});

//returns the date in the format of YYYY-MM-DD
hbs.registerHelper('getCurrentMonthYear', function() {
    let today = new Date();
	let year = today.getFullYear().toString();
    let month = (today.getMonth() + 1).toString().padStart(2, 0);
    return `${year}-${month}`;
});

//returns the date in the format of YYYY-MM-DD
hbs.registerHelper('getMonthYear', function(date) {
    date = new Date(date);
	let year = date.getFullYear().toString();
    let month = (date.getMonth() + 1).toString().padStart(2, 0);
    return `${year}-${month}`;
});

//returns the previous month
hbs.registerHelper('getPrevMonth', function(date) {
	let current;
	if (date.getMonth() == 0) {
	    current = new Date(date.getFullYear() - 1, 11, 1);
	} else {
	    current = new Date(date.getFullYear(), date.getMonth() - 1, 1);
	}
    return `${current.getFullYear()}-${current.getMonth()+1}`;
});

//returns the next month
hbs.registerHelper('getNextMonth', function(date) {
	let current;
	if (date.getMonth() == 11) {
	    current = new Date(date.getFullYear() + 1, 0, 1);
	} else {
	    current = new Date(date.getFullYear(), date.getMonth() + 1, 1);
	}
    return `${current.getFullYear()}-${current.getMonth()+1}`;
});

//returns a string with leading zero if single digit number
hbs.registerHelper('addLeadingZeros', function(num) {
    return num.toString().padStart(2, 0);
});

//Conditional that returns the content inside if the date parameter is later than the current date
hbs.registerHelper('isNotPastDate', function(date, options) {
    let today = new Date();
	let todayString = `${today.getFullYear().toString()}-${(today.getMonth() + 1).toString().padStart(2, 0)}-${today.getDate().toString().padStart(2, 0)}`;

    if (new Date(date) >= new Date(todayString)) {
        return options.fn(this);
    } else {
        return options.inverse(this);
    }
});
