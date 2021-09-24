const {Calendar} = require('calendar');

const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
];

const calendarController = {
    //loads the calendar with the values for the month, week, and date
    getCalendar: function (req, res) {
        //get the current month and year in the form of YYYY-MM-01
        let current = new Date(`${req.params.year}-${req.params.month}-01`);
        let cal = new Calendar();

        //place all the values that is to be loaded in the hbs file in an object
        let calendar = {
            username: req.session.username,
            currMonthNum: current.getMonth()+1,
            currMonthName: monthNames[current.getMonth()],
            daysInMonth: cal.monthDays(current.getFullYear(), current.getMonth()),
            currYear: current.getFullYear(),
            currMonthYear: current,
            today: new Date()
        };

        //renders the calendar page along with the values specified in the calendar object
        res.render('calendar', calendar);
    },
}

module.exports = calendarController;
