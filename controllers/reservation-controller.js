const db = require('../models/db.js');
const Booking = require('../models/booking-model.js');
const Guest = require('../models/guest-model.js');
const mongoose = require('mongoose');

const reservationController = {
    postCreateReservation: function (req, res) {
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
                    booked_type: type, //NOTE: Clean the string before saving to db
                    guest: result._id,
                    employee: req.session.employeeID,
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

    //loads the main reservation page along with the list of reservations for a specific date
    getReservationScreen: function(req, res){

        let today = new Date(req.params.year, req.params.month - 1, req.params.day);
        
        let reservation = {
            start_date: {$lte: today},
            end_date: {$gte: today},
            //it is considered to be a reservation when the confirmed_reservation exists in the database
            confirmed_reservation: {$exists: true}
        };

        //TODO: Change query after create booking is fixed
        db.findMany(Booking, reservation, function(result){

            let list = [];
            let previous;

            //categorize each room type into its own sub-array
            for (let i = 0; i < result.length; i++) {
                //current booked type is differet from the previous booked type
                if (previous == undefined || result[i].booked_type != previous.booked_type) {
                    //initialize 'previous' variable to keep track of previous reservation
                    previous = {
                        booked_type: result[i].booked_type,
                        reservations: [result[i]]
                    }
                    //add to the list of reservation
                    list.push(previous);
                //current booked type is same with the previous booked type
                } else {
                    previous.reservations.push(result[i]);
                }
            }

            res.render('reservation-main', {list: list});

        }, 'guest', {booked_type: 'asc'});

    }
}

module.exports = reservationController;
