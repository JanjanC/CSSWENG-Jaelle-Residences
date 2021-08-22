const db = require('../models/db.js');
const Activity = require('../models/activity-model.js');
const Booking = require('../models/booking-model.js');
const Guest = require('../models/guest-model.js');
const Room = require('../models/room-model.js');
const mongoose = require('mongoose');

const bookingController = {
	getBookingScreen: function (req, res) {

		let date = new Date(`${req.params.year}-${req.params.month}-${req.params.day}`);

		db.findMany(Room, {}, function (roomResult) {

			if (roomResult) {

				let list = [];
				for (let i = 0; i < roomResult.length; i++) {
					let room = {
						room: roomResult[i],
						booking: null
					}
					list.push(room);
				}

				let date = new Date(`${req.params.year}-${req.params.month}-${req.params.day}`);

				let booking = {
		            start_date: {$lte: date},
		            end_date: {$gte: date},
		            $or: [
						{confirmed_reservation: {$exists: false}},
		            	{confirmed_reservation: true}
					]
		        };

				db.findMany(Booking, booking, function (bookingResult) {
		        	if (bookingResult) {
						for (let i = 0; i < bookingResult.length; i++) {
							for (let j = 0; j < list.length; j++) {
								if (list[j].room._id.toString() == bookingResult[i].room._id.toString()) {
									list[j].booking = bookingResult[i];
									break;
								}
							}
							for(let k = 0; k < bookingResult[i].room.connected_rooms.length; k++) {

								for (let j = 0; j < list.length; j++) {
									if (list[j].room._id.toString() == bookingResult[i].room.connected_rooms[k].toString()) {
										list[j].booking = bookingResult[i];
										break;
									}
								}
							}
						}
						res.render('booking-main', {list: list, date: date});
		        	} else {
						res.redirect('/error');
					}
		        }, 'room guest');
			} else {
				res.redirect('/error')
			}
		}, undefined, {room_number: 'asc'});
	},

	getCreateBooking: function(req, res) {

		db.findOne(Room, {_id: req.params.roomID}, function(roomResult) {
			if (roomResult) {

				let date = new Date(`${req.params.year}-${req.params.month}-${req.params.day}`);

				let reservation = {
		            //the current date is between the start date and end date of the reservation, inclusive
		            start_date: date,
					booked_type: roomResult.room_type,
		            //it is considered to be a reservation when the confirmed_reservation exists in the database
		            confirmed_reservation: false,
		            is_cancelled: false
		        };

				db.findMany(Booking, reservation, function (reservationResult) {
					let values = {
	                    room: roomResult,
						reservations: reservationResult,
	                    date:date
	                }
					res.render('booking-create', values);
				}, 'guest');
			} else {
				res.redirect('/error');
			}
		});
	},

	postCreateBooking: function(req, res) {
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
                let booking = {
                    room: req.params.roomID,
                    booked_type: req.body.room_type,
                    guest: guestResult._id,
                    employee: req.session.employeeID,
                    start_date: req.body.start_date,
                    end_date: req.body.end_date,
					checked_in: false,
                    is_cancelled: false
                }

                // create a new booking in the database
                db.insertOne(Booking, booking, function(bookingResult){
                    if(bookingResult) {
                        let activity = {
                            employee: req.session.employeeID,
                            booking: bookingResult._id,
                            activity_type: 'Create Booking',
                            timestamp: new Date()
                        }

                        //saves the action of the employee to an activity log
                        db.insertOne(Activity, activity, function(activityResult) {
                            if (activityResult) {
                                // redirects to home screen after adding a record
                                res.redirect(`/${req.body.start_date}/booking/`);
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

    checkAvailability: function(req, res) {
        // extract dates and room number
        let start = new Date(req.query.start_date);
        let end = new Date(req.query.end_date);
		let rooms = req.query.rooms;
        let lower_bound = new Date(req.query.start_date);
        let upper_bound = new Date(req.query.end_date);
        lower_bound.setFullYear(lower_bound.getFullYear() - 5);
        upper_bound.setFullYear(upper_bound.getFullYear() + 5);
        // set conditions for the queries
        booking_query = {
            $and: [
                {room: {$in : rooms}},
                // reservation dates only within 5 years
                {$and: [
					{start_date: {$gte: lower_bound}},
					{end_date: {$lte: upper_bound}}
				]},
                // must be a booking
                {$or: [
					{confirmed_reservation: {$exists: false}},
					{confirmed_reservation: true}
				]},
                // cases to check for existing bookings
                {$or: [
                    {$and: [{start_date: {$gte: start}}, {end_date: {$lte: end}}]},
                    {$and: [{start_date: {$lte: end}}, {start_date: {$gte: start}}]},
                    {$and: [{end_date: {$gte: start}}, {end_date: {$lte: end}}]},
                    {$and: [{start_date: {$lte: start}}, {end_date: {$gte: end}}]}
                ]}
            ]
        };

        // find bookings for a specified room between the start and end date inclusive
        db.findOne(Booking, booking_query, function(result){
            // stores a Boolean signifying whether room is available or not
            // when a bookings is found
            if(result){
                res.send(false);
            // when no booking is found
            } else{
                res.send(true);
            }
        });
    },

	getRoom: function(req, res) {
		let roomID = req.query.roomID;

		db.findOne(Room, {_id: roomID}, function(result) {
			res.send(result);
		});
	},

	confirmReservation: function(req, res) {

		let reservation = {
            $set: {
				room: req.params.roomID,
                end_date: req.body.end_date,
				confirmed_reservation: true
            }
        }

		db.updateOne(Booking, {_id: req.body.reservation_select}, reservation, function (bookingResult) {

			if (bookingResult) {
				let guest = {
		            first_name: req.body.firstname,
		            last_name: req.body.lastname,
		            birthdate: req.body.birthdate,
		            address: req.body.address,
		            contact_number: req.body.contact,
		            company_name: req.body.company,
		            occupation: req.body.occupation
		        }

				db.updateOne(Guest, {_id: bookingResult.guest}, guest, function (guestResult) {
					if (guestResult) {

						let activity = {
                            employee: req.session.employeeID,
                            booking: bookingResult._id,
                            activity_type: 'Confirm Reservation',
                            timestamp: new Date()
                        }

						db.insertOne(Activity, activity, function(activityResult) {
                            if (activityResult) {
                                // redirects to booking screen after adding a record
                                res.redirect(`/${req.body.start_date}/booking/`);
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

	getEditBooking: function(req, res) {

		db.findOne(Booking, {_id: req.params.bookingID}, function(result) {
			if (result) {
				console.log(result);
				res.render('booking-edit', result);
			} else {
				res.redirect('/error');
			}
		}, 'room guest');
	},

	postEditBooking: function(req, res) {

		console.log(req.body);
		console.log(req.params);

		let booking = {
            $set: {
                end_date: req.body.end_date
            }
        }

        //update the booking details in the database
        db.updateOne(Booking, {_id: req.params.bookingID}, booking, function(bookingResult) {

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

            if (bookingResult) {
                //update the customer details in the database
                db.updateOne(Guest, {_id: bookingResult.guest}, guest, function(guestResult) {
                    if (guestResult) {

                        let activity = {
                            employee: req.session.employeeID,
                            booking: bookingResult._id,
                            activity_type: 'Modify Booking',
                            timestamp: new Date()
                        }

                        //saves the action of the employee to an activity log
                        db.insertOne(Activity, activity, function(activityResult) {
                            if (activityResult) {
                                // redirects to home screen after adding a record
                                res.redirect(`/${req.body.start_date}/booking/`);
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
	}

}

module.exports =  bookingController;
