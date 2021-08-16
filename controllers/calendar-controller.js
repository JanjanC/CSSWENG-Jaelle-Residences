const {Calendar} = require('calendar');

const monthNames = [
"January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const calendarController = {
    getCalendar: function (req, res) {
        let today = new Date();
        let cal = new Calendar();

        let calendar = {
            currMonthNum: today.getMonth()+1,
            currMonthName: monthNames[today.getMonth()],
            daysInMonth: cal.monthDays(today.getFullYear(), today.getMonth()),
            currYear: today.getFullYear()
        };

        res.render('calendar', calendar);
    },
}

module.exports = calendarController;
