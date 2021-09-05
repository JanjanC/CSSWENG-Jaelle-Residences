const db = require('../models/db.js');
const Activity = require('../models/activity-model.js');
const Booking = require('../models/booking-model.js');
const Guest = require('../models/guest-model.js');
const Room = require('../models/room-model.js');

const roomManagementController = {

    getRoomManagement: function (req, res) {

        let today = new Date();
		let dateString = `${today.getFullYear().toString()}-${(today.getMonth() + 1).toString().padStart(2, 0)}-${today.getDate().toString().padStart(2, 0)}`;
		let timeString = `${today.getHours().toString().padStart(2, 0)}:${(today.getMinutes()).toString().padStart(2, 0)}:59`;

		//there is a given time
		if (req.query.time !== undefined) {
			timeString = `${req.query.time}:59`;
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
		            start_date: {$lte: date},
		            end_date: {$gte: date},
		            $or: [
                        //booked
		            	{booked: true},
                        //checked in
                        {checked_in: true}
					],
					is_cancelled: false,
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

        //find the information of the room given a roomID
		db.findOne(Room, {_id: req.params.roomID}, function(roomResult) {
			if (roomResult) {
                console.log(roomResult);
                let today = new Date();
            	let todayString = `${today.getFullYear().toString()}-${(today.getMonth() + 1).toString().padStart(2, 0)}-${today.getDate().toString().padStart(2, 0)}`;

                let reservation = {
		            //the current date is between the start date and end date of the reservation, inclusive
					start_date: todayString,
 	               	end_date: {$gte: todayString},
					booked_type: roomResult.room_type,
		            reserved: true,
		            is_cancelled: false
		        };

                //find all the reservations such that the current date is between the start and end date of the reservation
                db.findMany(Booking, reservation, function (reservationResult) {
                    if (reservationResult) {
                        let values = {
    						username: req.session.username,
    	                    room: roomResult,
    						reservations: reservationResult,
    	                    date: todayString
    	                }
                        //loads the create check in page
        				res.render('check-in-vacant', values);
                    } else {
                        res.redirect('/error');
                    }
				}, 'guest');
			} else {
				res.redirect('/error');
			}
		});
    },

    postCheckWithoutReservation: function (req, res) {
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
                    start_date: new Date (),
                    end_date: new Date(`${req.body.end_date} 12:00:00`),
					reserved: false,
					booked: false,
					checked_in: true,
                    is_cancelled: false
                }

                // create a new booking in the database
                db.insertOne(Booking, booking, function(bookingResult){
                    if(bookingResult) {
                        let activity = {
                            employee: req.session.employeeID,
                            booking: bookingResult._id,
                            activity_type: 'Check-In Without Reservation',
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

    postCheckInWithoutBooking: function (req, res) {
        let reservation = {
            $set: {
				//assign the guest to a room
				room: req.params.roomID,
				start_date: new Date (),
                end_date: new Date(`${req.body.end_date} 12:00:00`),
				//check in the guest
				checked_in: true
            }
        }
		//confirm the reservation, assign the guest to a room, and update the booking dates
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
				//update the information of the guest
				db.updateOne(Guest, {_id: bookingResult.guest}, guest, function (guestResult) {
					if (guestResult) {

						let activity = {
                            employee: req.session.employeeID,
                            booking: bookingResult._id,
                            activity_type: 'Check-In Without Booking',
                            timestamp: new Date()
                        }
						//saves the action of the employee to an activity log
						db.insertOne(Activity, activity, function(activityResult) {
                            if (activityResult) {
                                // redirects to booking screen after adding a record
                                res.redirect(`/management`);
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

    postCheckIn: function (req, res) {
        let booking = {
            $set: {
                start_date: new Date(),
                checked_in: true
            }
        }

        //check in the guest by setting checked_in to true
        db.updateOne(Booking, {_id: req.params.bookingID}, booking, function(bookingResult) {

            if (bookingResult) {
                let activity = {
                    employee: req.session.employeeID,
                    booking: bookingResult._id,
                    activity_type: 'Check-In',
                    timestamp: new Date()
                }

                //saves the action of the employee to an activity log
                db.insertOne(Activity, activity, function(activityResult) {
                    if (activityResult) {
                        res.redirect(`/management`);
                    } else {
                        res.redirect('/error');
                    }
                });
            } else {
                res.redirect('/error');
            }
        });
    },

    postCheckOut: function (req, res) {
        let booking = {
            $set: {
                end_date: new Date(),
                checked_out: true
            }
        }

        //check in the guest by setting checked_in to true
        db.updateOne(Booking, {_id: req.params.bookingID}, booking, function(bookingResult) {

            if (bookingResult) {
                let activity = {
                    employee: req.session.employeeID,
                    booking: bookingResult._id,
                    activity_type: 'Check-Out',
                    timestamp: new Date()
                }

                //saves the action of the employee to an activity log
                db.insertOne(Activity, activity, function(activityResult) {
                    if (activityResult) {
                        res.redirect(`/management`);
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

module.exports = roomManagementController;
