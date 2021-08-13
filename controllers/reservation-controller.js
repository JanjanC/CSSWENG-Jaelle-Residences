const db = require('../models/db.js');
const Booking = require('../models/booking-model.js');
const Guest = require('../models/guest-model.js');
const mongoose = require('mongoose');

const reservationController = {
    postAddReservation: function (req, res) {
        // collect information from post form
        let start = req.body.start_date;
        let end = req.body.end_date;
        let type = req.body.reserve_type_select;

        // find guest record
        // NOTE: current set to only check first name; will update once finalized if name is going to be split
        let guest_query = {
            first_name: req.body.fullname
        };
        db.findOne(Guest, guest_query, function(result){
            // existing record found
            if(result){
                // create an object to be inserted into the database
                booking = {
                    booked_type: type,
                    guest_id: result._id,
                    employee_id: req.session.employeeID,
                    start_date: new Date(start),
                    end_date: new Date(end),
                    // TODO: confirm how this value is decided; maybe needs checkbox on form?
                    confirmed_reservation: false
                };

                // insert booking into database
                db.insertOne(Booking, booking, function(flag){
                    if(flag){
                        // redirects to home screen after adding a record
                        res.redirect('/index');
                    }
                });
            }
            // NOTE: behavior when no existing record found to be added once details of form finalized
        });
    },

    getReservationScreen: function(req, res){

        let reservation = {
            date: new Date(req.params.month, req.params.day, req.params.year)
        };

        // db.findMany(Booking, )
        res.render('reservation-main');
    }
}

module.exports = reservationController;
