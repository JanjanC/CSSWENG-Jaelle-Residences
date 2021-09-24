const db = require('../models/db.js');
const Employee = require('../models/employee-model.js');

const bcrypt = require(`bcryptjs`);

const signInController = {
    //loads the sign in page
    getSignIn: function (req, res) {
        //hide the username and password error messages by default
        answer = {
            usernameFlag: "hidden",
            passwordFlag: "hidden"
        };
        //renders the sign in page
        res.render('sign-in', answer);
    },

    //verifies if the sign in credentials of the user is valid
    postSignIn: function(req, res) {
        //collects the sign in credentials of the user in the post request
        let username = req.body.username;
        let password = req.body.password;

        //hide the username and password error messages by default
        answer = {
            usernameFlag: "hidden",
            passwordFlag: "hidden"
        };

        // verify the sign in credentials of the employee
        // checks if the username is found in the database
        db.findOne(Employee, {username: username}, function(result) {
            if(result) {
                answer.usernameFlag = "hidden";
                //compare the inputted password and the hashed password
                bcrypt.compare(password, result.password, function(err, equal) {
                    //the sign in credentials of the employee is valid
                    if (equal) {
                        //saves the username and the ID of the employee in the session
                        req.session.username = result.username;
                        req.session.employeeID = result._id;

                        //redirect to the room management page
                        res.redirect('/management/');
                    } else {
                        //the inputted password in incorrect
                        answer.passwordFlag = "";
                        //render the sign in page again
                        res.render('sign-in', answer);
                    }
                });
            } else {
                //the inputted username is not found
                answer.usernameFlag="";
                //render the sign in page again
                res.render('sign-in', answer);
            }
        });
    },

    //signs out the current user
    getSignOut: function(req, res) {
        //destroy the current session
        req.session.destroy(function(err) {
            if(err) throw err;
            //redirect to the index in case of an error
            res.redirect(`/`);
        });
    }
}

module.exports = signInController;
