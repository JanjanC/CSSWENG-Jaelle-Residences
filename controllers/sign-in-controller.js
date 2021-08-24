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
        answer = {usernameFlag: "hidden", passwordFlag: "hidden"};

        db.findOne(Employee, {username: username}, function(result) {
            if(result) {
                answer.usernameFlag = "hidden";
                bcrypt.compare(password, result.password, function(err, equal) {
                    if (equal) {
                        req.session.username = result.username;
                        req.session.employeeID = result._id;

                        res.redirect('/index');
                    } else {
                        answer.passwordFlag = "";
                        res.render('sign-in-fail', answer);
                    }
                });
            } else {
                answer.usernameFlag="";
                res.render('sign-in-fail', answer);
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
