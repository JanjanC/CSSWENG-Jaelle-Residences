const controller = {
    getIndex: function (req, res) {
        res.render('index', {today: new Date()});
    },
}

module.exports = controller;
