const controller = {
    getIndex: function (req, res) {
        res.render('index', {today: new Date()});
    },

    getError: function (req, res) {
        res.render('error');
    }
}

module.exports = controller;
