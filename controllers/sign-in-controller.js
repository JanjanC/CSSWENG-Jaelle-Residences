const db = require('../models/db.js');
const Employee = require('../models/employee-model.js');

const bcrypt = require(`bcryptjs`);

const signInController = {

    getSignIn: function (req, res) {
        answer = {usernameFlag: "hidden", passwordFlag: "hidden"};
        res.render('sign-in', answer);
    },

    getIndex: function (req, res) {
        // answer = {usernameFlag: "hidden", passwordFlag: "hidden"};
        res.render('index');
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

                        // let today = new Date();
                    	// let year = today.getFullYear().toString();
                        // let month = (today.getMonth() + 1).toString().padStart(2, 0);

                        // res.redirect(`/calendar/${year}-${month}`);
                        res.redirect('/management/');
                    } else {
                        answer.passwordFlag = "";
                        res.render('sign-in', answer);
                    }
                });
            } else {
                answer.usernameFlag="";
                res.render('sign-in', answer);
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
