const controller = {
    getIndex: function (req, res) {
        res.render('index');
    },

    getReservationAdd: function (req, res) {
        res.render('reservation-add');
    }
}

module.exports = controller;
