const db = require('../models/db.js');
const Employee = require('../models/employee-model.js');

const signInController = {

    getSignIn: function (req, res) {
        res.render('sign-in');
    },

    postSignIn: function (req, res) {

        let employee = {
            username: req.body.username,
            password: req.body.password
        }

        db.findOne(Employee, employee, function(result) {
            if(result) {
                req.session.username = result.username;
                req.session.employeeID = result._id;
                res.redirect('index');
            }
        });
    },

    getSignOut: function(req, res) {
        req.session.destroy(function(err) {
            if(err) throw err;
            res.redirect(`/`);
        });
    }
}

module.exports = signInController;
