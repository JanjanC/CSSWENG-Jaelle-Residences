const db = require('../models/db.js');
const Activity = require('../models/activity-model.js');
const Booking = require('../models/booking-model.js');
const Guest = require('../models/guest-model.js');
const Room = require('../models/room-model.js');
const Transaction = require('../models/transaction-model.js');

const roomManagementController = {

    getRoomManagement: function (req, res) {

        let today = new Date();
		let dateString = `${today.getFullYear().toString()}-${(today.getMonth() + 1).toString().padStart(2, 0)}-${today.getDate().toString().padStart(2, 0)}`;
		let hourMinuteString = `${today.getHours().toString().padStart(2, 0)}:${(today.getMinutes()).toString().padStart(2, 0)}:00`;
        let fullTimeString = `${today.getHours().toString().padStart(2, 0)}:${(today.getMinutes()).toString().padStart(2, 0)}:59`
		//there is a given time
		if (req.query.time !== undefined) {
            hourMinuteString = `${req.query.time}:00`
			fullTimeString = `${req.query.time}:59`;
		}

        let date = new Date(`${dateString} ${fullTimeString}`);

        //find all the rooms in the database
		db.findMany(Room, {}, function (roomResult) {

			if (roomResult) {

				let list = [];
				//transform the list of rooms into an object so that a booking may be later linked to a room
				for (let i = 0; i < roomResult.length; i++) {
					let room = {
						room: roomResult[i],
						booking: {}
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
					isCancelled: false,
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
										//make the room unavailable
										list[j].booking.unavailable = true;
										break;
									}
								}
							}
						}

						let values = {
							username: req.session.username,
							list: list,
							date: dateString,
							time: hourMinuteString
						}

						//loads the room-management page
						res.render('room-management', values);
		        	} else {
						res.redirect('/error');
					}
		        }, 'room guest transaction');
			} else {
				res.redirect('/error')
			}
		}, undefined, {room_number: 'asc'});
    },

    getCheckInVacant: function (req, res) {
        let today = new Date();
    	let todayString = `${today.getFullYear().toString()}-${(today.getMonth() + 1).toString().padStart(2, 0)}-${today.getDate().toString().padStart(2, 0)}`;

        //find the information of the room given a roomID
		db.findOne(Room, {_id: req.params.roomID}, function(result) {
			if (result) {
				//stores the room information and the current date into an object
				let values = {
					username: req.session.username,
                    room: result,
                    date: today
                }
				//loads the create booking page
				res.render('check-in', values);
			} else {
				res.redirect('/error');
			}
		});
    },

    postCheckInWithoutReservation: function (req, res) {
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

                let transaction = {
                    duration: req.body.duration,
                    averageRate: req.body.room_rate,
                    roomCost: req.body.room_initial_cost,
                    pax: req.body.room_pax,
                    pwdCount: req.body.room_pwd,
                    seniorCitizenCount: req.body.room_senior,
                    additionalPhpDiscount: {
                        reason: req.body.room_discount_reason_php,
                        amount: req.body.room_discount_php
                    },
                    additionalPercentDiscount: {
                        reason: req.body.room_discount_reason_php,
                        amount: req.body.room_discount_percent
                    },
                    totalDiscount: req.body.room_subtract,
                    extraCharges: req.body.room_extra,
                    totalCharges: req.body.room_total_extra,
                    netCost: req.body.room_net_cost,
                    payment: req.body.room_payment,
                    balance: req.body.room_balance
                }

                db.insertOne(Transaction, transaction, function(transactionResult) {
                    if (transactionResult) {
                        //collect the booking information from post request and set default values
                        let booking = {
                            room: req.params.roomID,
                            bookedType: req.body.room_type,
                            guest: guestResult._id,
                            employee: req.session.employeeID,
                            startDate: new Date (),
                            endDate: new Date(`${req.body.end_date} 12:00:00`),
        					checkedIn: true,
                            transaction: transactionResult._id
                        }

                        // create a new booking in the database
                        db.insertOne(Booking, booking, function(bookingResult){
                            if(bookingResult) {
                                let activity = {
                                    employee: req.session.employeeID,
                                    booking: bookingResult._id,
                                    activityType: 'Check-In Without Reservation',
                                    timestamp: new Date()
                                }

                                //saves the action of the employee to an activity log
                                db.insertOne(Activity, activity, function(activityResult) {
                                    if (activityResult) {
                                        // redirects to home screen after adding a record
                                        res.redirect(`/management/`);
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
            } else {
                res.redirect('/error');
            }
        });
    },

    checkCheckInAvailability: function(req, res) {
        // extract dates and room numbers
        let start = new Date();
        let end = new Date(`${req.query.endDate} 12:00:00`);
		let rooms = req.query.rooms;
        let lowerBound = new Date(req.query.startDate);
        let upperBound = new Date(req.query.endDate);
        lowerBound.setFullYear(lowerBound.getFullYear() - 5);
        upperBound.setFullYear(upperBound.getFullYear() + 5);
        // set the conditions for the queries
		query = {
			$and: [
				{room: {$in : rooms}},
				// reservation dates only within 5 years
				{$and: [
					{startDate: {$gte: lowerBound}},
					{endDate: {$lte: upperBound}}
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
		if(req.query.bookingID != ''){
			query.$and.push({_id: {$ne: req.query.bookingID}});
		}

        // find atleast one booking for a specified room between the start and end date inclusive
        db.findOne(Booking, query, function(result){
            // a booking is found
            if(result){
                res.send(false);
            // no booking is found
        	} else {
                res.send(true);
            }
        });
    },
}

module.exports = roomManagementController;
