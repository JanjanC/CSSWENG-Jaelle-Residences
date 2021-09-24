const db = require('../models/db.js');
const Activity = require('../models/activity-model.js');
const Booking = require('../models/booking-model.js');
const Guest = require('../models/guest-model.js');
const Room = require('../models/room-model.js');
const Transaction = require('../models/transaction-model.js');
const printEvent = require('./print-controller.js');

const roomManagementController = {

    //load the room management screen page along with the current booked and checked in rooms
    getRoomManagement: function (req, res) {
        //get the date today  as the default date in the form of YYYY/MM/DD
        let today = new Date();
        //get the date today  as the default date in the form of YYYY-MM-DD
		let dateString = `${today.getFullYear().toString()}-${(today.getMonth() + 1).toString().padStart(2, 0)}-${today.getDate().toString().padStart(2, 0)}`;
        //get the time now as the default time in the form of HH:MM:00
        let hourMinuteString = `${today.getHours().toString().padStart(2, 0)}:${(today.getMinutes()).toString().padStart(2, 0)}:00`;
        //get the time now as the default time in the form of HH:MM:59
        let fullTimeString = `${today.getHours().toString().padStart(2, 0)}:${(today.getMinutes()).toString().padStart(2, 0)}:59`

		//a time is given as part of the query
		if (req.query.time !== undefined) {
            //reformat the time in the form of HH:MM:00
            hourMinuteString = `${req.query.time}:00`
            //reformat the time in the form of HH:MM:59
			fullTimeString = `${req.query.time}:59`;
		}

        //form the current date and time by concatening the date and time string
        let date = new Date(`${dateString} ${fullTimeString}`);

        //find all the rooms in the database
		db.findMany(Room, {}, function (roomResult) {

			if (roomResult) {
                //an array containg the list of rooms
				let list = [];
				//transform the list of rooms into an object so that a booking may be later linked to a room
				for (let i = 0; i < roomResult.length; i++) {
					let room = {
						room: roomResult[i],
						booking: {}
					}
					list.push(room);
				}

                //the list of conditions that are to be met in the query
                let booking = {
					//the current date is between the start date and end date of the booking, inclusive
		            startDate: {$lte: date},
		            endDate: {$gte: date},
                    //the booking is currently either booked or checked in
		            $or: [
                        //booked
		            	{booked: true},
                        //checked in
                        {checkedIn: true}
					],
                    //the booking is neither checked our nor cancelled
                    checkedOut: false,
					isCancelled: false,
		        };

                //find all the bookings that matches the conditions specified in the booking variable
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

                        //place all the values that is to be loaded in the hbs file in an object
						let values = {
							username: req.session.username,
							list: list,
							date: dateString,
							time: hourMinuteString
						}

						//loads the room-management page along with the values specified in the values object
						res.render('room-management', values);
		        	} else {
                        //redirect to an error page if an error occured
						res.redirect('/error');
					}
		        }, 'room guest transaction');
			} else {
                //redirect to an error page if an error occured
				res.redirect('/error')
			}
		}, undefined, {room_number: 'asc'});
    },

    //load the create check in page for a vacant room
    getCheckInVacant: function (req, res) {

        //retrieve the information of the room given a roomID
		db.findOne(Room, {_id: req.params.roomID}, function(roomResult) {
			if (roomResult) {
                // get the date today in the form of YYYY-MM-DD
                let today = new Date();
            	let todayString = `${today.getFullYear().toString()}-${(today.getMonth() + 1).toString().padStart(2, 0)}-${today.getDate().toString().padStart(2, 0)}`;

                //the list of conditions that are to be met in the query
                let reservation = {
		            //the current date is between the start date and end date of the reservation, inclusive
					startDate: todayString,
 	               	endDate: {$gte: todayString},
					bookedType: roomResult.room_type,
                    reserved: true,
					booked: false,
					checkedIn: false,
					checkedOut: false,
		            isCancelled: false
		        };

                //find all the reservations such that the current date is between the start and end date of the reservation
                db.findMany(Booking, reservation, function (reservationResult) {
                    if (reservationResult) {
                        //place all the values that is to be loaded in the hbs file in an object
                        let values = {
    						username: req.session.username,
    	                    room: roomResult,
    						reservations: reservationResult,
    	                    date: todayString
    	                }
                        //loads the create check in page along with values specified in the check in page
        				res.render('check-in', values);
                    } else {
                        //redirect to an error page if an error occured
                        res.redirect('/error');
                    }
				}, 'guest');
			} else {
                //redirect to an error page if an error occured
				res.redirect('/error');
			}
		});
    },

    //saves the data from the create checkin to the database when no prior reservation has been made by the guest
    postCheckInWithoutReservation: function (req, res) {
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

                // collect the transaction information from post request that is to be stored to the database
                let transaction = {
                    duration: req.body.duration,
                    averageRate: req.body.room_rate,
                    pax: req.body.room_pax,
                    pwdCount: req.body.room_pwd,
                    seniorCitizenCount: req.body.room_senior,
                    additionalPhpDiscount: {
                        reason: req.body.room_discount_reason_php,
                        amount: req.body.room_discount_php
                    },
                    additionalPercentDiscount: {
                        reason: req.body.room_discount_reason_percent,
                        amount: req.body.room_discount_percent
                    },
                    extraPaxCharges: {
                        count: req.body.extra_bed_count,
                        amount: req.body.extra_pax_cost_php
                    },
                    extraBedCharges: {
                       count: req.body.extra_bed_count,
                       amount: req.body.extra_bed_cost_php
                   },
                    extraPetCharges: req.body.extra_pet_cost_php,
                    roomCost: req.body.room_initial_cost,
                    totalDiscount: req.body.room_subtract,
                    totalCharges: req.body.room_total_extra,
                    netCost: req.body.room_net_cost,
                    payment: req.body.room_payment,
                    balance: req.body.room_balance
                }

                // the field for the other charges exists as part of the post request
                if(req.body.other_charges_arr) {
                    transaction.otherCharges = JSON.parse(req.body.other_charges_arr);
                }


                //stores the transaction object to the database
                db.insertOne(Transaction, transaction, function(transactionResult) {
                    if (transactionResult) {
                        // collect the booking information from post request that is to be stored to the database
                        let booking = {
                            room: req.params.roomID,
                            bookedType: req.body.room_type,
                            guest: guestResult._id,
                            employee: req.session.employeeID,
                            //set the start date to the current date and time
                            startDate: new Date (),
                            //set the end time to 12pm by default
                            endDate: new Date(`${req.body.end_date} 12:00:00`),
        					checkedIn: true,
                            transaction: transactionResult._id
                        }

                        // stores the booking the database
                        db.insertOne(Booking, booking, function(bookingResult){
                            if(bookingResult) {
                                // opens print preview page if print receipt checkbox is ticked
                                if(req.body.print_receipt == "") {
                                    printEvent.emitPrintEvent(bookingResult._id);
                                }

                                //saves the activity of the employee to the database
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
                                        res.redirect('/management/');
                                    } else {
                                        //redirect to an error if an error occured
                                        res.redirect('/error');
                                    }
                                });
                            } else {
                                //redirect to an error if an error occured
                                res.redirect('/error');
                            }
                        });
                    } else {
                        //redirect to an error if an error occured
                        res.redirect('/error');
                    }
                });
            } else {
                //redirect to an error if an error occured
                res.redirect('/error');
            }
        });
    },

    //checks the availability if the room is currently avaialable for check in
    checkCheckInAvailability: function(req, res) {
        //find the room information given the roomID
		db.findOne(Room, {_id: req.query.roomID}, function(roomResult) {
            // creates an array of rooms containing the current room and the connect rooms
			let rooms = [];
            //add the current room to the array
			rooms.push(req.query.roomID);
			if (roomResult && roomResult.connected_rooms) {
                //loops through each of the connected rooms
				for (let i = 0; i < roomResult.connected_rooms.length; i++) {
                    //add the list of connected rooms to the array
					rooms.push(roomResult.connected_rooms[i]);
				}
			}

			// retrieves the start and end date from the query
	        let start = new Date();
	        let end = new Date(`${req.query.endDate} 12:00:00`);

            //set a lowwer and upper bound for the dates so as to minimize the time of the query
	        let lowerBound = new Date(req.query.startDate);
	        let upperBound = new Date(req.query.endDate);
            //the lower bound and upper bound are to +/- 5 years from the current date
	        lowerBound.setFullYear(lowerBound.getFullYear() - 5);
	        upperBound.setFullYear(upperBound.getFullYear() + 5);

	        // set the conditions for the queries
			query = {
				$and: [
                    //checks the status of both the current room and the connected rooms
					{room: {$in : rooms}},
					// the reservation dates is within 5 years
					{$and: [
						{startDate: {$gte: lowerBound}},
						{endDate: {$lte: upperBound}}
					]},
					// the booking must either be currently booked or checked in
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
                        //the inputted start date is between the start and end date of the booking
						// booking_start_date <= inputted_start_date <= booking_end_date
						{$and: [
							{startDate: {$gte: start}},
							{startDate: {$lte: end}}
						]},
                        //the inputted end date is between the start and end date of the booking
						// booking_start_date <= inputted_end_date <= booking_end_date
						{$and: [
							{endDate: {$gte: start}},
							{endDate: {$lte: end}}
						]},
                        // the inputted start and end date is between the start and end date of the booking
						// booking_start_date <= inputted_start_date <= inputted_end_date <= booking_end_date
						{$and: [
							{startDate: {$lte: start}},
							{endDate: {$gte: end}}
						]},
                        //the booking start and end date is between the inputted start and end date
						//inputted_start_date <= booking_start_date <= booking_end_date <= inputted_end_date
						{$and: [
							{startDate: {$gte: start}},
							{endDate: {$lte: end}}
						]}
					]}
				]
			};

			// a booking ID is included as part of the query
			if(req.query.bookingID != '') {
                // do not include its own bookingID in the query to prevent a conflicting booking
				query.$and.push({_id: {$ne: req.query.bookingID}});
			}

	        // find atleast one booking for a specified room between the start and end date inclusive
	        db.findOne(Booking, query, function(result) {
	            // a booking is found
	            if(result) {
                    //the room is not available for checkin
	                res.send(false);
	            // no booking is found
	        	} else {
                    //the room is avaialble for checkin
	                res.send(true);
	            }
	        });

		});
    },

    //saves the data from the create checkin to the database when no prior booking has been made by the guest
    postCheckInWithoutBooking: function (req, res) {
        // collect the transaction information from post request that is to be stored to the database
        let transaction = {
            duration: req.body.duration,
            averageRate: req.body.room_rate,
            pax: req.body.room_pax,
            pwdCount: req.body.room_pwd,
            seniorCitizenCount: req.body.room_senior,
            additionalPhpDiscount: {
                reason: req.body.room_discount_reason_php,
                amount: req.body.room_discount_php
            },
            additionalPercentDiscount: {
                reason: req.body.room_discount_reason_percent,
                amount: req.body.room_discount_percent
            },
            extraPaxCharges: {
                count: req.body.extra_bed_count,
                amount: req.body.extra_pax_cost_php
            },
            extraBedCharges: {
                count: req.body.extra_bed_count,
                amount: req.body.extra_bed_cost_php
            },
            extraPetCharges: req.body.extra_pet_cost_php,
            roomCost: req.body.room_initial_cost,
            totalDiscount: req.body.room_subtract,
            totalCharges: req.body.room_total_extra,
            netCost: req.body.room_net_cost,
            payment: req.body.room_payment,
            balance: req.body.room_balance
        }

        // the field for the other charges exists as part of the post request
        if(req.body.other_charges_arr) {
            transaction.otherCharges = JSON.parse(req.body.other_charges_arr);
        }

        //stores the transaction object to the database
        db.insertOne(Transaction, transaction, function(transactionResult) {
            if (transactionResult) {
                let reservation = {
                    $set: {
        				//assign the guest to a specific room
        				room: req.params.roomID,
                        //set the start date to the current date and time
        				startDate: new Date (),
                        //set the end date to 12pm by default
                        endDate: new Date(`${req.body.end_date} 12:00:00`),
        				//checks in the guest by setting the checkedIn variable to true
        				checkedIn: true,
                        //updates the transaction ID of the booking
                        transaction: transactionResult._id
                    }
                }

        		//update the booking information in the database with the contents as specified in the reservation object
        		db.updateOne(Booking, {_id: req.body.reservation_select}, reservation, function (bookingResult) {

        			if (bookingResult) {
                        // opens print preview page if print receipt checkbox is ticked
                        if(req.body.print_receipt == "") {
                            printEvent.emitPrintEvent(bookingResult._id);
                        }

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
        				//update the guest information in the database with the contents as specified in the guest object
        				db.updateOne(Guest, {_id: bookingResult.guest}, guest, function (guestResult) {
        					if (guestResult) {
                                //create an object indicating the activity of the employee
        						let activity = {
                                    employee: req.session.employeeID,
                                    booking: bookingResult._id,
                                    activityType: 'Check-In Without Booking',
                                    timestamp: new Date()
                                }
        						//saves the action of the employee to an activity log
        						db.insertOne(Activity, activity, function(activityResult) {
                                    if (activityResult) {
                                        // redirects to booking screen after adding a record
                                        res.redirect('/management/');
                                    } else {
                                        //redirects to an error page if an error occured
                                        res.redirect('/error');
                                    }
                                });
        					} else {
                                //redirects to an error page if an error occured
        						res.redirect('/error');
        					}
        				});
        			} else {
                        //redirects to an error page if an error occured
        				res.redirect('/error');
        			}
        		});
            } else {
                //redirects to an error page if an error occured
                res.redirect('/error');
            }
        });
    },


    //checks in the guest when a prior booking has been made
    postCheckIn: function (req, res) {
        // set the start date to the current date and time and set the checkedIn status to true
        let booking = {
            $set: {
                startDate: new Date(),
                checkedIn: true
            }
        }

        //checks in the guest by setting checkedIn to true
        db.updateOne(Booking, {_id: req.params.bookingID}, booking, function(bookingResult) {

            if (bookingResult) {
                // opens print preview window if print receipt checkbox is ticked
                if(req.body.print_receipt == "") {
                    printEvent.emitPrintEvent(bookingResult._id);
                }

                //stores the activity of the employee to an object
                let activity = {
                    employee: req.session.employeeID,
                    booking: bookingResult._id,
                    activityType: 'Check-In',
                    timestamp: new Date()
                }

                //saves the action of the employee to an activity log
                db.insertOne(Activity, activity, function(activityResult) {
                    if (activityResult) {
                        //redirect to the room management page
                        res.redirect('/management/');
                    } else {
                        //redirect to an error page if an error occured
                        res.redirect('/error');
                    }
                });
            } else {
                //redirect to an error page if an error occured
                res.redirect('/error');
            }
        });
    },

    //loads the checkout page along with the booking and transaction information of the guest
    getCheckOut: function (req, res) {
        //get the booking information given the bookingID
        db.findOne(Booking, {_id: req.params.bookingID}, function(result) {
            if (result) {
                //stores the booking result and the current username of the employee in an object
                let values = {
                    username: req.session.username,
                    booking: result,
                }
                //render the check out screen along with the values specified in the values object
                res.render('check-out', values);
            } else {
                //redirect to an error page if an error occured
                res.redirect('/error');
            }
        }, 'room guest transaction');
    },

    //update the checkedOut status of the booking in the database
    postCheckOut: function (req, res) {
        // set the end date to the current date and time and set the checkedOut status to true
        let booking = {
            $set: {
                endDate: new Date(),
                checkedOut: true
            }
        }

        //check out the guest by setting the checkedOut status to true
        db.updateOne(Booking, {_id: req.params.bookingID}, booking, function(bookingResult) {

            if (bookingResult) {
                // opens print preview page if print receipt checkbox is ticked
                if(req.body.print_receipt == "") {
                    printEvent.emitPrintEvent(bookingResult._id);
                }

                //automatically require housekeeping for the room
                let room = {
                    $set: {
                        needHousekeeping: true
                    }
                }

                //update room maintenance of room by setting the needHouse keeping status to true
                db.updateOne(Room, {_id: bookingResult.room}, room, function (roomResult) {
                    if (roomResult) {

                        // collect the guest information from post request that is to be stored to the database
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
                            //update the guest information in the database with the contents as specified in the guest object
                            db.updateOne(Guest, {_id: bookingResult.guest}, guest, function(guestResult) {
                                if (guestResult) {

                                    //collect the transaction details in the post request that is to be stored in the database
                                    let transaction = {
                                        duration: req.body.duration,
                                        averageRate: req.body.room_rate,
                                        pax: req.body.room_pax,
                                        pwdCount: req.body.room_pwd,
                                        seniorCitizenCount: req.body.room_senior,
                                        additionalPhpDiscount: {
                                            reason: req.body.room_discount_reason_php,
                                            amount: req.body.room_discount_php
                                        },
                                        additionalPercentDiscount: {
                                            reason: req.body.room_discount_reason_percent,
                                            amount: req.body.room_discount_percent
                                        },
                                        extraPaxCharges: {
                                            count: req.body.extra_bed_count,
                                            amount: req.body.extra_pax_cost_php
                                        },
                                        extraBedCharges: {
                                            count: req.body.extra_bed_count,
                                            amount: req.body.extra_bed_cost_php
                                        },
                                        extraPetCharges: req.body.extra_pet_cost_php,
                                        roomCost: req.body.room_initial_cost,
                                        totalDiscount: req.body.room_subtract,
                                        totalCharges: req.body.room_total_extra,
                                        netCost: req.body.room_net_cost,
                                        payment: req.body.room_payment,
                                        balance: req.body.room_balance
                                    }

                                    // add other charges field if it exists
                                    if(req.body.other_charges_arr) {
                                        transaction.otherCharges = JSON.parse(req.body.other_charges_arr);
                                    }

                                    //update the transaction details with the information as specified in the transaction object
                                    db.updateOne(Transaction, {_id: bookingResult.transaction}, transaction, function(transactionResult) {
                                        if (transactionResult) {

                                            //creates an activity object that records the activity of the employee
                                            let activity = {
                                                employee: req.session.employeeID,
                                                booking: bookingResult._id,
                                                activityType: 'Check-Out',
                                                timestamp: new Date()
                                            }

                                            //saves the action of the employee to an activity log
                                            db.insertOne(Activity, activity, function(activityResult) {
                                                if (activityResult) {
                                                    // redirects to home screen after updating the booking
                                                    res.redirect('/management/');
                                                } else {
                                                    //redirect to an error page if an error occured
                                                    res.redirect('/error');
                                                }
                                            });
                                        } else {
                                            //redirect to an error page if an error occured
                                            res.redirect('/error');
                                        }
                                    });

                                } else {
                                    //redirect to an error page if an error occured
                                    res.redirect('/error');
                                }
                            });
                        } else {
                            //redirect to an error page if an error occured
                            res.redirect('/error');
                        }

                    } else {
                        //redirect to an error page if an error occured
                        res.redirect('/error');
                    }
                });
            } else {
                //redirect to an error page if an error occured
                res.redirect('/error');
            }
        });
    },

    //loads the checkout page along with the booking and transaction information of the guest
    getEditCheckIn: function(req, res) {

        //retrieves all the rooms in the database
        db.findMany(Room, {}, function(roomResult) {
            if (roomResult) {

                //get the booking information from the database given a bookingID
                db.findOne(Booking, {_id: req.params.bookingID}, function(bookingResult) {
        			if (bookingResult) {
                        //stoes the value that are to be loaded to the hbs file in an object
                        let values = {
                            username: req.session.username,
                            rooms: roomResult,
                            booking: bookingResult,
                        }
        				//render the edit check in screen along with the values specified in the values object
        				res.render('check-in-edit', values);
        			} else {
                        //redirect to an error page if something went wrong
        				res.redirect('/error');
        			}
        		}, 'room guest transaction');

            } else {
                //redirect to an error page if something went wrong
                res.redirect('/error');
            }
        }, undefined, {room_number: 'asc'});
	},

    //updates the booking information of the guest in the database
	postEditCheckIn: function(req, res) {
        // collect the booking information from post request that is to be stored to the database
		let booking = {
            $set: {
                endDate: new Date(`${req.body.endDate} 12:00:00`)
            }
        }

        // a new room in which the guest wishes to transfer to is included in the post request
        if (req.body.transfer_select != '') {
            booking.$set.room = req.body.transfer_select;
        }


        //update the booking details in the database with the contents as specified in the booking object
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
                // opens print preview window when print receipt checkbox is ticked
                if(req.body.print_receipt == "") {
                    printEvent.emitPrintEvent(bookingResult._id);
                }


                //update the guest details in the database with the contents as specified in the guest object
                db.updateOne(Guest, {_id: bookingResult.guest}, guest, function(guestResult) {
                    if (guestResult) {

                        // collect the transaction information from post request that is to be stored to the database
                        let transaction = {
                            duration: req.body.duration,
                            averageRate: req.body.room_rate,
                            pax: req.body.room_pax,
                            pwdCount: req.body.room_pwd,
                            seniorCitizenCount: req.body.room_senior,
                            additionalPhpDiscount: {
                                reason: req.body.room_discount_reason_php,
                                amount: req.body.room_discount_php
                            },
                            additionalPercentDiscount: {
                                reason: req.body.room_discount_reason_percent,
                                amount: req.body.room_discount_percent
                            },
                            extraPaxCharges: {
                                count: req.body.extra_bed_count,
                                amount: req.body.extra_pax_cost_php
                            },
                            extraBedCharges: {
                               count: req.body.extra_bed_count,
                               amount: req.body.extra_bed_cost_php
                           },
                            extraPetCharges: req.body.extra_pet_cost_php,
                            roomCost: req.body.room_initial_cost,
                            totalDiscount: req.body.room_subtract,
                            totalCharges: req.body.room_total_extra,
                            netCost: req.body.room_net_cost,
                            payment: req.body.room_payment,
                            balance: req.body.room_balance
                        }

                        // add other charges field if it exists
                        if(req.body.other_charges_arr) {
                            transaction.otherCharges = JSON.parse(req.body.other_charges_arr);
                        }

                        //update the transaction details with the information as specified in the transaction object
                        db.updateOne(Transaction, {_id: bookingResult.transaction}, transaction, function(transactionResult) {
                            if (transactionResult) {

                                //creates an activity object that records the activity of the employee
                                let activity = {
                                    employee: req.session.employeeID,
                                    booking: bookingResult._id,
                                    activityType: 'Modify Check-In',
                                    timestamp: new Date()
                                }

                                //saves the action of the employee to an activity log
                                db.insertOne(Activity, activity, function(activityResult) {
                                    if (activityResult) {
                                        // redirects to home screen after updating the booking
                                        res.redirect('/management/');
                                    } else {
                                        //redirect to an error page if an error occured
                                        res.redirect('/error');
                                    }
                                });
                            } else {
                                //redirect to an error page if an error occured
                                res.redirect('/error');
                            }
                        });

                    } else {
                        //redirect to an error page if an error occured
                        res.redirect('/error');
                    }
                });
            } else {
                //redirect to an error page if an error occured
                res.redirect('/error');
            }
        });
    },

    //loads the transfer room page along with the booking and transaction transaction of the guest
    getTransfer: function (req, res) {

        //retrieves all the room in the databse
        db.findMany(Room, {}, function(roomResult) {
            if (roomResult) {

                //get the booking information from the database given a bookingID
                db.findOne(Booking, {_id: req.params.bookingID}, function(bookingResult) {
        			if (bookingResult) {
                        //stores the values that are to be loaded to the hbs file in an object
                        let values = {
                            username: req.session.username,
                            rooms: roomResult,
                            booking: bookingResult,
                        }
                        //render the transfer screen along with the values specified in the value object
                        res.render('transfer', values);
        			} else {
                        //redirect to an error page
        				res.redirect('/error');
        			}
        		}, 'room guest transaction');

            } else {
                //redirect to an error page
                res.redirect('/error');
            }
        }, undefined, {room_number: 'asc'});
    },

    //updates the current room of the guest in the database
    postTransfer: function (req, res) {

        // collect the booking information from post request that is to be stored to the database
        let booking = {
            $set: {
                room: req.body.transfer_select,
                endDate: new Date(`${req.body.transfer_end_date} 12:00:00`)
            }
        }


        //update the booking details in the database with the contents as specified in the booking object
        db.updateOne(Booking, {_id: req.params.bookingID}, booking, function(bookingResult) {

            if (bookingResult) {
                // collect the transaction information from post request that is to be stored to the database
                let transaction = {
                    duration: req.body.duration,
                    averageRate: req.body.room_rate,
                    pax: req.body.room_pax,
                    pwdCount: req.body.room_pwd,
                    seniorCitizenCount: req.body.room_senior,
                    additionalPhpDiscount: {
                        reason: req.body.room_discount_reason_php,
                        amount: req.body.room_discount_php
                    },
                    additionalPercentDiscount: {
                        reason: req.body.room_discount_reason_percent,
                        amount: req.body.room_discount_percent
                    },
                    extraPaxCharges: {
                        count: req.body.extra_bed_count,
                        amount: req.body.extra_pax_cost_php
                    },
                    extraBedCharges: {
                       count: req.body.extra_bed_count,
                       amount: req.body.extra_bed_cost_php
                   },
                    extraPetCharges: req.body.extra_pet_cost_php,
                    roomCost: req.body.room_initial_cost,
                    totalDiscount: req.body.room_subtract,
                    totalCharges: req.body.room_total_extra,
                    netCost: req.body.room_net_cost,
                    payment: req.body.room_payment,
                    balance: req.body.room_balance
                }

                // add other charges field if it exists
                if(req.body.other_charges_arr) {
                    transaction.otherCharges = JSON.parse(req.body.other_charges_arr);
                }

                //update the transaction details with the information as specified in the transaction object
                db.updateOne(Transaction, {_id: bookingResult.transaction}, transaction, function(transactionResult) {
                    if (transactionResult) {

                        //creates an activity object that records the activity of the employee
                        let activity = {
                            employee: req.session.employeeID,
                            booking: bookingResult._id,
                            activityType: 'Modify Check-In',
                            timestamp: new Date()
                        }

                        //saves the action of the employee to an activity log
                        db.insertOne(Activity, activity, function(activityResult) {
                            if (activityResult) {
                                // redirects to home screen after updating the booking
                                res.redirect('/management/');
                            } else {
                                //redirect to an error page if an error ocurred
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

    //get the set room maintenance status page along with the current maintenance status of the room
    getRoomMaintenance: function (req, res) {
        //find the room information given a roomID
        db.findOne(Room, {_id: req.params.roomID}, function(roomResult) {
            if (roomResult) {
                //stores the room information and the current username of the employee in an object
                let values = {
                    username: req.session.username,
                    room: roomResult,
                }
                //render the room maintenance screen along with the values specified in the values object
                res.render('room-maintenance', values);
            } else {
                //redirect to an error page if an error occured
                res.redirect('/error');
            }
        });
    },

    //update the maintenance status of the room in the databse
    postRoomMaintenance: function (req, res)  {
        //collect the set status of the room from the post request
        let room = {
            $set: {
                needHousekeeping: req.body.housekeeping_select,
                needRepair: req.body.repair_select
            }
        }

        //update the room maintenance status of the room with the contents specified in the room object
        db.updateOne(Room, {_id: req.params.roomID}, room, function(roomResult) {
            if (roomResult) {
                //redirect to the room management page
                res.redirect('/management/');
            } else {
                //redirect to an error page if an error occured
                res.redirect('/error');
            }
        });
    }
}

module.exports = roomManagementController;
