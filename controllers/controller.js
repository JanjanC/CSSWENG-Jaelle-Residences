const controller = {
    getIndex: function (req, res) {
        res.render('index');
    },

    getCreateReservation: function (req, res) {
        res.render('reservation-create');
    }
}

module.exports = controller;
