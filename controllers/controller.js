const controller = {
    getIndex: function (req, res) {
        res.render('index');
    },

    getReservationMain: function (req, res) {
        res.render('reservation-main');
    },

    getReservationAdd: function (req, res) {
        res.render('reservation-add');
    }
}

module.exports = controller;
