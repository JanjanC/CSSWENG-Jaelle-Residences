const hbs = require(`hbs`);

hbs.registerHelper('formatDate', function(date) {
	var month = (date.getMonth() + 1).toString().padStart(2, 0);
	var day = date.getDate().toString().padStart(2, 0);
	var year = date.getFullYear().toString();
    return `${month}-${day}-${year}`;
});
