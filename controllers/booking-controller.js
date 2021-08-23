const db = require('../models/db.js');
const Activity = require('../models/activity-model.js');
const Booking = require('../models/booking-model.js');
const Guest = require('../models/guest-model.js');
const Room = require('../models/room-model.js');
const mongoose = require('mongoose');

const bookingController = {
	getBookingScreen: function (req, res) {

		let date = new Date(`${req.params.year}-${req.params.month}-${req.params.day}`);

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
		            start_date: {$lte: date},
		            end_date: {$gte: date},
					//it is considered to be a reservation when the confirmed_reservation does not exists in the database (i.e., it was a direct booking)
					//or the reservation has been confirmed
		            $or: [
						{confirmed_reservation: {$exists: false}},
		            	{confirmed_reservation: true}
					],
					is_cancelled: false
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
							//lop the each othe connected rooms in the booking
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
						//loads the main booking page
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
		//find the information of the room given a roomID
		db.findOne(Room, {_id: req.params.roomID}, function(result) {
			if (result) {
				//stores the room information and the current date into an object
				let values = {
                    room: result,
                    date: new Date(`${req.params.year}-${req.params.month}-${req.params.day}`)
                }
				//loads the create booking page
				res.render('booking-create', values);
			} else {
				res.redirect('/error');
			}
		});
	},

	postCreateBooking: function(req, res) {
		// collect the guest information from post request
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
				//collect the booking information from post request and set default values
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

	getRoom: function(req, res) {
		let roomID = req.query.roomID;
		//find the information of the room given a roomID
		db.findOne(Room, {_id: roomID}, function(result) {
			//send the room information
			res.send(result);
		});
	},

    checkAvailability: function(req, res) {
        // extract dates and room numbers
        let start = new Date(req.query.start_date);
        let end = new Date(req.query.end_date);
		let rooms = req.query.rooms;
        let lower_bound = new Date(req.query.start_date);
        let upper_bound = new Date(req.query.end_date);
        lower_bound.setFullYear(lower_bound.getFullYear() - 5);
        upper_bound.setFullYear(upper_bound.getFullYear() + 5);
        // set the conditions for the queries
        booking_query = {
            $and: [
                {room: {$in : rooms}},
                // reservation dates only within 5 years
                {$and: [
					{start_date: {$gte: lower_bound}},
					{end_date: {$lte: upper_bound}}
				]},
                // must be an active booking
                {$and:[
                    {$or: [
                        {confirmed_reservation: {$exists: false}},
                        {confirmed_reservation: true}]},
                    {is_cancelled: false}
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

        // find atleast one booking for a specified room between the start and end date inclusive
        db.findOne(Booking, booking_query, function(result){
            // a booking is found
            if(result){
                res.send(false);
            // no booking is found
            } else{
                res.send(true);
            }
        });
    }
}

module.exports =  bookingController;
