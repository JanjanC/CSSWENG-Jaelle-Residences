const controller = {
    getIndex: function (req, res) {
        res.render('index');
    },

    getReservationMain: function (req, res) {
        res.render('reservation-main');
    }
}



module.exports = controller;
