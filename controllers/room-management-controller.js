const db = require('../models/db.js');
const Activity = require('../models/activity-model.js');
const Booking = require('../models/booking-model.js');
const Guest = require('../models/guest-model.js');
const Room = require('../models/room-model.js');

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
							time: hourMinuteString
						}

						//loads the room-management page
						res.render('room-management', values);
		        	} else {
						res.redirect('/error');
					}
		        }, 'room guest');
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
				//collect the booking information from post request and set default values
                let booking = {
                    room: req.params.roomID,
                    bookedType: req.body.room_type,
                    guest: guestResult._id,
                    employee: req.session.employeeID,
                    startDate: new Date (),
                    endDate: new Date(`${req.body.endDate} 12:00:00`),
					checkedIn: true,
                    pax: req.body.room_pax,
					payment: req.body.room_payment
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
    },
}

module.exports = roomManagementController;
