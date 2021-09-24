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

        //the list of conditions that are to be met in the query
        let reservation = {
            //the current date is between the start date and end date of the reservation, inclusive
            startDate: {$lte: date},
            endDate: {$gte: date},
            //the reservation is currently reserved
            reserved: true,
            booked: false,
            checkedIn: false,
            checkedOut: false,
            isCancelled: false
        };

        //find the list of bookings that matches the specified condtions in the reservation object
        db.findMany(Booking, reservation, function(result){
            if (result) {
                //an array containing the list of reservation
                let list = [];
                let previous;

                //categorize each room type into its own sub-array
                for (let i = 0; i < result.length; i++) {
                    //current booked type is differet from the previous booked type
                    if (previous == undefined || result[i].bookedType != previous.bookedType) {
                        //initialize 'previous' variable to keep track of previous reservation
                        previous = {
                            bookedType: result[i].bookedType,
                            reservations: [result[i]]
                        }
                        //add to the list of reservation
                        list.push(previous);
                        //current booked type is same with the previous booked type
                    } else {
                        previous.reservations.push(result[i]);
                    }
                }

                //place all the values that are to be loaded in the hbs file in an object
                values = {
                    username: req.session.username,
                    list: list,
                    date: date
                }

                //loads the main reservation page along with the values specified in the values object
                res.render('reservation-main', values);
            } else {
                //redirect to an error page if an error occured
                res.redirect('/error');
            }
        }, 'guest', {bookedType: 'asc'});
    },

    //loads the create reservation screen
    getCreateReservation: function (req, res) {
        //find all unique room types in the database
        db.findDistinct(Room, 'room_type', function(result) {
            if (result) {
                //place all the values that is to be loaded in the hbs file in an object
                let values = {
                    username: req.session.username,
                    rooms: result,
                    date: new Date(`${req.params.year}-${req.params.month}-${req.params.day}`)
                }
                //loads the create reservation along with the values specified in the values object
                res.render('reservation-create', values);
            } else {
                //redirects to an error page if an error occured
                res.redirect('/error');
            }
        });
    },

    //saves the data from created reservation to the databse
    postCreateReservation: function (req, res) {
        // collect the guest information from post request that is to be stored to the database
        let guest = {
            firstName: req.body.firstname,
            lastName: req.body.lastname,
            birthdate: req.body.birthdate,
            address: req.body.address,
            contact: req.body.contact,
            company: req.body.company,
            occupation: req.body.occupation
        }

        //stores the guest object to the database
        db.insertOne(Guest, guest, function(guestResult){
            if(guestResult) {
                // collect the guest information from post request that is to be stored to the database
                let reservation = {
                    bookedType: req.body.reserve_type_select,
                    guest: guestResult._id,
                    employee: req.session.employeeID,
                    startDate: req.body.start_date,
                    endDate: req.body.end_date,
                    //set the reserved status to true
                    reserved: true
                }

                // stores the reservation object to the databse
                db.insertOne(Booking, reservation, function(reservationResult){
                    if(reservationResult) {

                        //records the activity of the user in an activity object
                        let activity = {
                            employee: req.session.employeeID,
                            booking: reservationResult._id,
                            activityType: 'Create Reservation',
                            timestamp: new Date()
                        }

                        //saves the action of the employee to an activity log
                        db.insertOne(Activity, activity, function(activityResult) {
                            if (activityResult) {
                                // redirects to home screen after adding a record
                                res.redirect(`/${req.body.start_date}/reservation/`);
                            } else {
                                //redirects to an error page in case of an error
                                res.redirect('/error');
                            }
                        });
                    } else {
                        //redirects to an error page in case of an error
                        res.redirect('/error');
                    }
                });
            } else {
                //redirects to an error page in case of an error
                res.redirect('/error');
            }
        });
    },

    getEditReservation: function (req, res) {

        //find all unique room types in the database
        db.findDistinct(Room, 'room_type', function(roomResult) {
            if (roomResult) {
                //get the reservation details given a bookingID so that the update booking formed will be pre-filled
                db.findOne(Booking, {_id: req.params.bookingID}, function(reservationResult) {

                    if (reservationResult) {
                        //places the values that are to be loaded to the hbs file in an object
                        let values = {
                            username: req.session.username,
                            rooms: roomResult,
                            reservation: reservationResult
                        }
                        //renders the edit reservation along with the values specified in the values object
                        res.render('reservation-edit', values);
                    } else {
                        //redirects to an error page in case of an error
                        res.redirect('/error');
                    }
                }, 'guest');
            } else {
                //redirects to an error page in case of an error
                res.redirect('/error');
            }
        });
    },

    //update the reservation information of the guest to the databse
    postEditReservation: function (req, res) {

        // collect the reservation information from the post request that is to be stored to the database
        let reservation = {
            $set: {
                bookedType: req.body.reserve_type_select,
                startDate: req.body.start_date,
                endDate: req.body.end_date
            }
        }

        //update the reservation details in the database with the contents as specified in the reservation object
        db.updateOne(Booking, {_id: req.params.bookingID}, reservation, function(reservationResult) {

            // collect the guest information from the post request that is to be stored to the database
            let guest = {
                $set: {
                    firstName: req.body.firstname,
                    lastName: req.body.lastname,
                    birthdate: req.body.birthdate,
                    address: req.body.address,
                    contact: req.body.contact,
                    company: req.body.company,
                    occupation: req.body.occupation
                }
            }

            if (reservationResult) {
                //update the customer details in the database with the contents as specified in the guest object
                db.updateOne(Guest, {_id: reservationResult.guest}, guest, function(guestResult) {
                    if (guestResult) {

                        //stores the activity of the employee to an object
                        let activity = {
                            employee: req.session.employeeID,
                            booking: reservationResult._id,
                            activityType: 'Modify Reservation',
                            timestamp: new Date()
                        }

                        //saves the action of the employee to an activity log
                        db.insertOne(Activity, activity, function(activityResult) {
                            if (activityResult) {
                                // redirects to home screen after adding a record
                                res.redirect(`/${req.body.start_date}/reservation/`);
                            } else {
                                //redirects to an error page in case of an error
                                res.redirect('/error');
                            }
                        });
                    } else {
                        //redirects to an error page in case of an error
                        res.redirect('/error');
                    }
                });
            } else {
                //redirects to an error page in case of an error
                res.redirect('/error');
            }
        });
    },

    //delete the previously created reservation of the guest
    postDeleteReservation: function (req, res) {

        //set the reserved status to cancelled
        let reservation = {
            $set: {
                isCancelled: true
            }
        }

        //cancel the booking by setting isCancelled to true
        db.updateOne(Booking, {_id: req.params.bookingID}, reservation, function(reservationResult) {

            if (reservationResult) {

                //creates an object that records the activity of the employee
                let activity = {
                    employee: req.session.employeeID,
                    booking: reservationResult._id,
                    activityType: 'Cancel Reservation',
                    timestamp: new Date()
                }

                //saves the action of the employee to an activity log
                db.insertOne(Activity, activity, function(activityResult) {
                    if (activityResult) {
                        //get the date of the start date of the reservation in the form of YYYY-MM-DD
                        let startDate = new Date(reservationResult.startDate);
                        let startDateString = `${startDate.getFullYear().toString()}-${(startDate.getMonth() + 1).toString().padStart(2, 0)}-${startDate.getDate().toString().padStart(2, 0)}`;

                        //redirect to the main reservation with the current date set as the start date of the deleted reservation
                        res.redirect(`/${startDateString}/reservation/`);
                    } else {
                        //redirects to an error page in case of an error
                        res.redirect('/error');
                    }
                });
            } else {
                //redirects to an error page in case of an error
                res.redirect('/error');
            }
        });
    },

    //retrieves the reservation information given a reservation ID
    getReservation: function (req, res) {
        let reservationID = req.query.reservationID;
        //get the reservation information given a reservationID
        db.findOne(Booking, {_id: reservationID}, function (result) {
            if (result) {
                //send the information of the room
                res.send(result);
            }
        }, 'guest');
    }
}

module.exports = reservationController;
