const db = require('../models/db.js');
const Activity = require('../models/activity-model.js');
const Booking = require('../models/booking-model.js');
const Guest = require('../models/guest-model.js');
const Room = require('../models/room-model.js');
const mongoose = require('mongoose');

const bookingController = {
	getBookingScreen: function (req, res) {
		let today = new Date();
		let dateString = `${today.getFullYear().toString()}-${(today.getMonth() + 1).toString().padStart(2, 0)}-${today.getDate().toString().padStart(2, 0)}`;
		let timeString = `${today.getHours().toString().padStart(2, 0)}:${(today.getMinutes()).toString().padStart(2, 0)}:00`;

		//there is a given time
		if (req.query.time !== undefined) {
			timeString = `${req.query.time}:00`;
		}

		//there is a given date
		if (req.params.year !== undefined && req.params.month !== undefined && req.params.day !== undefined) {
			dateString = `${req.params.year}-${req.params.month}-${req.params.day}`;
		}

		let date = new Date(`${dateString} ${timeString}`);

		//find all the rooms in the database
		db.findMany(Room, {}, function (roomResult) {

			if (roomResult) {

				let list = [];
				//transform the list of rooms into an object so that a booking may be later linked to a room
				for (let i = 0; i < roomResult.length; i++) {
					let room = {
						room: roomResult[i],
						booking: null
					}
					list.push(room);
				}

				let booking = {
					//the current date is between the start date and end date of the booking, inclusive
		            startDate: {$lte: date},
		            endDate: {$gte: date},
					$or: [
                        //booked
		            	{booked: true},
                        //checked in
                        {checkedIn: true}
					],
					checkedOut: false,
					isCancelled: false
		        };

				db.findMany(Booking, booking, function (bookingResult) {
		        	if (bookingResult) {
						//loop through each booking
						for (let i = 0; i < bookingResult.length; i++) {
							//loop through each room
							for (let j = 0; j < list.length; j++) {
								//check if the room id of the booking matches the id of the room
								if (list[j].room._id.toString() == bookingResult[i].room._id.toString()) {
									//links the room to a booking
									list[j].booking = bookingResult[i];
									break;
								}
							}
							//loop through each of the connected rooms in the booking
							for(let k = 0; k < bookingResult[i].room.connected_rooms.length; k++) {
								//loop through each room
								for (let j = 0; j < list.length; j++) {
									//check if the room id of the connected rooms in the booking matches the id of the room
									if (list[j].room._id.toString() == bookingResult[i].room.connected_rooms[k].toString()) {
										//links the room to a booking
										list[j].booking = bookingResult[i];
										break;
									}
								}
							}
						}

						let values = {
							username: req.session.username,
							list: list,
							date: dateString,
							time: timeString
						}

						//loads the main booking page
						res.render('booking-main', values);
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
		//find the information of the room given a roomID
		db.findOne(Room, {_id: req.params.roomID}, function(roomResult) {
			if (roomResult) {

				let date = new Date(`${req.params.year}-${req.params.month}-${req.params.day}`);

				let reservation = {
		            //the current date is between the start date and end date of the reservation, inclusive
					startDate: date,
 	               	endDate: {$gte: date},
					bookedType: roomResult.room_type,
		            reserved: true,
					booked: false,
					checkedIn: false,
					checkedOut: false,
		            isCancelled: false
		        };
				//find all the reservations such that the current date is between the start and end date of the reservation
				db.findMany(Booking, reservation, function (reservationResult) {
					let values = {
						username: req.session.username,
	                    room: roomResult,
						reservations: reservationResult,
	                    date:date
	                }
					//reender to create booking page
					res.render('booking-create', values);
				}, 'guest');
			} else {
				res.redirect('/error');
			}
		});
	},

	postCreateBooking: function(req, res) {
		// collect the guest information from post request
        let guest = {
            firstName: req.body.firstname,
            lastName: req.body.lastname,
            birthdate: req.body.birthdate,
            address: req.body.address,
            contact: req.body.contact,
            company: req.body.company,
            occupation: req.body.occupation
        }

        //create a new guest document in the database
        db.insertOne(Guest, guest, function(guestResult){
            if(guestResult) {
				//collect the booking information from post request and set default values
                let booking = {
                    room: req.params.roomID,
                    bookedType: req.body.room_type,
                    guest: guestResult._id,
                    employee: req.session.employeeID,
                    startDate: new Date (`${req.body.start_date} 14:00:00`),
                    endDate: new Date(`${req.body.endDate} 12:00:00`),
					booked: true,
					pax: req.body.room_pax,
					payment: req.body.room_payment
                }

                // create a new booking in the database
                db.insertOne(Booking, booking, function(bookingResult){
                    if(bookingResult) {
                        let activity = {
                            employee: req.session.employeeID,
                            booking: bookingResult._id,
                            activityType: 'Create Booking',
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
        // extract dates and room numbers
        let start = new Date(`${req.query.startDate} 14:00:00`);
        let end = new Date(`${req.query.endDate} 12:00:00`);
		let rooms = req.query.rooms;
        let lower_bound = new Date(req.query.startDate);
        let upper_bound = new Date(req.query.endDate);
        lower_bound.setFullYear(lower_bound.getFullYear() - 5);
        upper_bound.setFullYear(upper_bound.getFullYear() + 5);
        // set the conditions for the queries
		booking_query = {
			$and: [
				{room: {$in : rooms}},
				// reservation dates only within 5 years
				{$and: [
					{startDate: {$gte: lower_bound}},
					{endDate: {$lte: upper_bound}}
				]},
				// must be an active booking
				{$and:[
					{$or: [
						{booked: true},
						{checkedIn: true}
					]},
					{checkedOut: false},
					{isCancelled: false}
				]},
				// cases to check for existing bookings
				{$or: [
					{$and: [{startDate: {$gte: start}}, {endDate: {$lte: end}}]},
					{$and: [{startDate: {$lte: end}}, {startDate: {$gte: start}}]},
					{$and: [{endDate: {$gte: start}}, {endDate: {$lte: end}}]},
					{$and: [{startDate: {$lte: start}}, {endDate: {$gte: end}}]}
				]}
			]
		};

		// when checking availability while editing booking, do not include itself as a conflicting booking
		if(req.query.bookingid != ''){
			booking_query.$and.push({_id: {$ne: req.query.bookingid}});
		}

        // find atleast one booking for a specified room between the start and end date inclusive
        db.findOne(Booking, booking_query, function(result){
            // a booking is found
            if(result){
                res.send(false);
            // no booking is found
        	} else {
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
				//assign the guest to a room
				room: req.params.roomID,
				startDate: new Date (`${req.body.start_date} 14:00:00`),
                endDate: new Date(`${req.body.endDate} 12:00:00`),
				//confirm the reservation
				booked: true,
				pax: req.body.room_pax,
				payment: req.body.room_payment
            }
        }
		//confirm the reservation, assign the guest to a room, and update the booking dates
		db.updateOne(Booking, {_id: req.body.reservation_select}, reservation, function (bookingResult) {

			if (bookingResult) {
				let guest = {
		            firstName: req.body.firstname,
		            lastName: req.body.lastname,
		            birthdate: req.body.birthdate,
		            address: req.body.address,
		            contact: req.body.contact,
		            company: req.body.company,
		            occupation: req.body.occupation
		        }
				//upda the information of the guest
				db.updateOne(Guest, {_id: bookingResult.guest}, guest, function (guestResult) {
					if (guestResult) {

						let activity = {
                            employee: req.session.employeeID,
                            booking: bookingResult._id,
                            activityType: 'Confirm Reservation',
                            timestamp: new Date()
                        }
						//saves the action of the employee to an activity log
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
		//get the booking information given the bookingID
		db.findOne(Booking, {_id: req.params.bookingID}, function(result) {
			if (result) {
				//render the edit booking screen
				res.render('booking-edit', result);
			} else {
				res.redirect('/error');
			}
		}, 'room guest');
	},

	postEditBooking: function(req, res) {
		let booking = {
            $set: {
				startDate: new Date (`${req.body.start_date} 14:00:00`),
                endDate: new Date(`${req.body.endDate} 12:00:00`),
				pax: req.body.room_pax,
				payment: req.body.room_payment
            }
        }

        //update the booking details in the database
        db.updateOne(Booking, {_id: req.params.bookingID}, booking, function(bookingResult) {

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

            if (bookingResult) {
                //update the customer details in the database
                db.updateOne(Guest, {_id: bookingResult.guest}, guest, function(guestResult) {
                    if (guestResult) {

                        let activity = {
                            employee: req.session.employeeID,
                            booking: bookingResult._id,
                            activityType: 'Modify Booking',
                            timestamp: new Date()
                        }

                        //saves the action of the employee to an activity log
                        db.insertOne(Activity, activity, function(activityResult) {
                            if (activityResult) {
                                // redirects to home screen after updating the booking
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

	postDeleteBooking: function(req, res) {
		let booking = {
            $set: {
                isCancelled: true
            }
        }

        //cancel the booking by setting isCancelled to true
        db.updateOne(Booking, {_id: req.params.bookingID}, booking, function(bookingResult) {

            if (bookingResult) {
                let activity = {
                    employee: req.session.employeeID,
                    booking: bookingResult._id,
                    activityType: 'Cancel Booking',
                    timestamp: new Date()
                }

                //saves the action of the employee to an activity log
                db.insertOne(Activity, activity, function(activityResult) {
                    if (activityResult) {
						let startDate = new Date(bookingResult.startDate);
                        let startDateString = `${startDate.getFullYear().toString()}-${(startDate.getMonth() + 1).toString().padStart(2, 0)}-${startDate.getDate().toString().padStart(2, 0)}`;

                        res.redirect(`/${startDateString}/booking/`);
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
