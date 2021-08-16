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
hbs.registerHelper('addLeadingZeros', function(num) {
	if (num >= 1 && num <= 9)
		return `0` + num;
    return num;
});
