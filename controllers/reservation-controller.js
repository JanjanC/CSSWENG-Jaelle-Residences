const db = require('../models/db.js');
const Booking = require('../models/booking-model.js');
const Guest = require('../models/guest-model.js');
const Room = require('../models/room-model.js');
const mongoose = require('mongoose');

const reservationController = {
    //loads the main reservation page along with the list of reservations for a specific date
    getReservationScreen: function(req, res){

        let today = new Date(`${req.params.year}-${req.params.month}-${req.params.day}`);

        let reservation = {
            start_date: {$lte: today},
            end_date: {$gte: today},
            //it is considered to be a reservation when the confirmed_reservation exists in the database
            confirmed_reservation: {$exists: true}
        };

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

    },

    getCreateReservation: function (req, res) {
        db.findDistinct(Room, 'room_type', function(result) {

            console.log();
            let values = {
                room_types: result,
                date: new Date(`${req.params.year}-${req.params.month}-${req.params.day}`)
            }
            res.render('reservation-create', values);
        });
    },

    postCreateReservation: function (req, res) {
        // collect information from post request
        let guest = {
            first_name: req.body.firstname,
            last_name: req.body.lastname,
            birthdate: new Date(req.body.birthdate),
            address: req.body.address,
            contact_number: req.body.contact_number,
            company_name: req.body.company,
            occupation: req.body.occupation
        }

        db.insertOne(Guest, guest, function(result){
            // existing record found
            if(result){
                console.log(result);
                // create an object to be inserted into the database
                let reservation = {
                    // // booked_rate: ,
                    booked_type: req.body.reserve_type_select,
                    guest: result._id,
                    employee: req.session.employeeID,
                    start_date: new Date (req.body.start_date),
                    end_date: new Date (req.body.end_date),
                    confirmed_reservation: false
                }

                // insert booking into database
                db.insertOne(Booking, reservation, function(flag){
                    if(result){
                        // redirects to home screen after adding a record
                        res.redirect('/index');
                    }
                });
            }
        });
    },
}

module.exports = reservationController;
