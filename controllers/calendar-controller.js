const {Calendar} = require('calendar');

const monthNames = [
"January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const calendarController = {
    getCalendar: function (req, res) {
        let current = new Date(`${req.params.year}-${req.params.month}-01`);
        let cal = new Calendar();

        let calendar = {
            currMonthNum: current.getMonth()+1,
            currMonthName: monthNames[current.getMonth()],
            daysInMonth: cal.monthDays(current.getFullYear(), current.getMonth()),
            currYear: current.getFullYear(),
            currMonthYear: current,
            today: new Date()
        };

        res.render('calendar', calendar);
    },
}

module.exports = calendarController;
