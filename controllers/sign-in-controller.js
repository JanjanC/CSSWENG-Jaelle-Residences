const db = require('../models/db.js');
const Employee = require('../models/employee-model.js');

const bcrypt = require(`bcryptjs`);

const signInController = {

    getSignIn: function (req, res) {
        res.render('sign-in');
    },

    postSignIn: function(req, res) {

        let username = req.body.username;
        let password = req.body.password;

        db.findOne(Employee, {username: username}, function(result) {
            if(result) {
                bcrypt.compare(password, result.password, function(err, equal) {
                    if (equal) {
                        req.session.username = result.username;
                        req.session.employeeID = result._id;

                        res.redirect('/index');
                    } else {
                        // TODO: redirect to sign in failure page
                    }
                });
            } else {
                res.redirect('/error');
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
