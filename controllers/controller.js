const controller = {
    getIndex: function (req, res) {
        res.render('index', {today: new Date()});
    },

    getEditReservation: function (req, res) {
        res.render('reservation-edit');
    }
}

module.exports = controller;
