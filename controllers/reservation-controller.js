const db = require('../models/db.js');
const Activity = require('../models/activity-model.js');
const Booking = require('../models/booking-model.js');
const Guest = require('../models/guest-model.js');
const Room = require('../models/room-model.js');
const mongoose = require('mongoose');

const reservationController = {
    //loads the main reservation page along with the list of reservations for a specific date
    getReservationScreen: function(req, res){

        let date = new Date(`${req.params.year}-${req.params.month}-${req.params.day}`);

        let reservation = {
            //the current date is between the start date and end date of the reservation, inclusive
            start_date: {$lte: date},
            end_date: {$gte: date},
            //it is considered to be a reservation when the confirmed_reservation exists in the database
            confirmed_reservation: {$exists: true},
            is_cancelled: false
        };

        db.findMany(Booking, reservation, function(result){
            if (result) {
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
                res.render('reservation-main', {list: list, date: date});
            } else {
                res.redirect('/error');
            }
        }, 'guest', {booked_type: 'asc'});
    },

    getCreateReservation: function (req, res) {
        //find all unique room types in the database
        db.findDistinct(Room, 'room_type', function(result) {
            if (result) {
                let values = {
                    room_types: result,
                    date: new Date(`${req.params.year}-${req.params.month}-${req.params.day}`)
                }
                res.render('reservation-create', values);
            } else {
                res.redirect('/error');
            }
        });
    },

    postCreateReservation: function (req, res) {
        // collect information from post request
        let guest = {
            first_name: req.body.firstname,
            last_name: req.body.lastname,
            birthdate: req.body.birthdate,
            address: req.body.address,
            contact_number: req.body.contact,
            company_name: req.body.company,
            occupation: req.body.occupation
        }

        //create a new guest document in the database
        db.insertOne(Guest, guest, function(guestResult){
            if(guestResult) {
                // create an object to be inserted into the database
                let reservation = {
                    // // booked_rate: ,
                    booked_type: req.body.reserve_type_select,
                    guest: guestResult._id,
                    employee: req.session.employeeID,
                    start_date: req.body.start_date,
                    end_date: req.body.end_date,
                    confirmed_reservation: false,
                    is_cancelled: false
                }

                // create a new reservation in the database
                db.insertOne(Booking, reservation, function(reservationResult){
                    if(reservationResult) {
                        let activity = {
                            employee: req.session.employeeID,
                            booking: reservationResult._id,
                            activity_type: 'Create Reservation',
                            timestamp: new Date()
                        }

                        //saves the action of the employee to an activity log
                        db.insertOne(Activity, activity, function(activityResult) {
                            if (activityResult) {
                                // redirects to home screen after adding a record
                                res.redirect(`/${req.body.start_date}/reservation/`);
                            } else {
                                res.redirect('/error');
                            }
                        });
                    } else {
                        res.redirect('/error');
                    }
                });
            } else {
                res.redirect('/error');
            }
        });
    },

    getEditReservation: function (req, res) {

        //find all unique room types in the database
        db.findDistinct(Room, 'room_type', function(roomResult) {
            if (roomResult) {
                //get the reservation details so that the update booking formed will be pre-filled
                db.findOne(Booking, {_id: req.params.bookingID}, function(reservationResult) {

                    if (reservationResult) {
                        let values = {
                            room_types: roomResult,
                            reservation: reservationResult
                        }
                        res.render('reservation-edit', values);
                    } else {
                        res.redirect('/error');
                    }
                }, 'guest');
            } else {
                res.redirect('/error');
            }
        });
    },

    postEditReservation: function (req, res) {
        let reservation = {
            $set: {
                booked_type: req.body.reserve_type_select,
                start_date: req.body.start_date,
                end_date: req.body.end_date
            }
        }

        //update the reservation details in the database
        db.updateOne(Booking, {_id: req.params.bookingID}, reservation, function(reservationResult) {

            let guest = {
                $set: {
                    first_name: req.body.firstname,
                    last_name: req.body.lastname,
                    birthdate: req.body.birthdate,
                    address: req.body.address,
                    contact_number: req.body.contact,
                    company_name: req.body.company,
                    occupation: req.body.occupation
                }
            }

            if (reservationResult) {
                //update the customer details in the database
                db.updateOne(Guest, {_id: reservationResult.guest}, guest, function(guestResult) {
                    if (guestResult) {

                        let activity = {
                            employee: req.session.employeeID,
                            booking: reservationResult._id,
                            activity_type: 'Modify Reservation',
                            timestamp: new Date()
                        }

                        //saves the action of the employee to an activity log
                        db.insertOne(Activity, activity, function(activityResult) {
                            if (activityResult) {
                                // redirects to home screen after adding a record
                                res.redirect(`/${req.body.start_date}/reservation/`);
                            } else {
                                res.redirect('/error');
                            }
                        });
                    } else {
                        res.redirect('/error');
                    }
                });
            } else {
                res.redirect('/error');
            }
        });
    },

    postDeleteReservation: function (req, res) {

        let reservation = {
            $set: {
                is_cancelled: true
            }
        }

        //cancel the booking by setting is_cancelled to true
        db.updateOne(Booking, {_id: req.params.bookingID}, reservation, function(reservationResult) {

            if (reservationResult) {
                let activity = {
                    employee: req.session.employeeID,
                    booking: reservationResult._id,
                    activity_type: 'Cancel Reservation',
                    timestamp: new Date()
                }

                //saves the action of the employee to an activity log
                db.insertOne(Activity, activity, function(activityResult) {
                    if (activityResult) {
                        // redirects to home screen after deleting a record
                        let today = new Date();
                    	let todayString = `${today.getFullYear().toString()}-${(today.getMonth() + 1).toString().padStart(2, 0)}-${today.getDate().toString().padStart(2, 0)}`;

                        res.redirect(`/${todayString}/reservation/`);
                    } else {
                        res.redirect('/error');
                    }
                });
            } else {
                res.redirect('/error');
            }
        });
    }
}

module.exports = reservationController;
