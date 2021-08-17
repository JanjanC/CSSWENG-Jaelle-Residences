const controller = {
    getIndex: function (req, res) {
        res.render('index', {today: new Date()});
    },

    getEditReservation: function (req, res) {
        res.render('reservation-edit');
    },

    getError: function (req, res) {
        res.render('error');
    }
}

module.exports = controller;
