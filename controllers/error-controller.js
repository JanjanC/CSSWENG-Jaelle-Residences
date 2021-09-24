const errorController = {

    //loads the error page in the event of an error
    getError: function (req, res) {
        //renders the error page
        res.render('error');
    }
}

module.exports = errorController;
