const controller = {
    getIndex: function (req, res) {
        res.render('index', {today: new Date()});
    },

    getCreateReservation: function (req, res) {
        res.render('reservation-create');
    },

    getEditReservation: function (req, res) {
        res.render('reservation-edit');
    }
}

module.exports = controller;
