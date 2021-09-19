const db = require('../models/db.js');
const Activity = require('../models/activity-model.js');
const Booking = require('../models/booking-model.js');
const Guest = require('../models/guest-model.js');
const Room = require('../models/room-model.js');
const Transaction = require('../models/transaction-model');
const Employee = require('../models/employee-model');
const mongoose = require('mongoose');
const printEvent = require('./print-controller.js');

const bookingController = {
	getPrint: function(req, res) {
		res.render('print');
	},

	getBookingScreen: function (req, res) {
		let today = new Date();
		let dateString = `${today.getFullYear().toString()}-${(today.getMonth() + 1).toString().padStart(2, 0)}-${today.getDate().toString().padStart(2, 0)}`;
		let hourMinuteString = `${today.getHours().toString().padStart(2, 0)}:${(today.getMinutes()).toString().padStart(2, 0)}:00`;
        let fullTimeString = `${today.getHours().toString().padStart(2, 0)}:${(today.getMinutes()).toString().padStart(2, 0)}:59`

		//there is a given time
		if (req.query.time !== undefined) {
			hourMinuteString = `${req.query.time}:00`
			fullTimeString = `${req.query.time}:59`;
		}

		//there is a given date
		if (req.params.year !== undefined && req.params.month !== undefined && req.params.day !== undefined) {
			dateString = `${req.params.year}-${req.params.month}-${req.params.day}`;
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

						//loads the main booking page
						res.render('booking-main', values);
		        	} else {
						res.redirect('/error');
					}
		        }, 'room guest transaction');
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
		console.log(req.body);
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

				if(req.body.other_charges_arr)
					transaction.otherCharges = JSON.parse(req.body.other_charges_arr);

				db.insertOne(Transaction, transaction, function(transactionResult) {
				    if (transactionResult) {
						//collect the booking information from post request and set default values
						let booking = {
							room: req.params.roomID,
							bookedType: req.body.room_type,
							guest: guestResult._id,
							employee: req.session.employeeID,
							startDate: new Date (`${req.body.start_date} 14:00:00`),
							endDate: new Date(`${req.body.end_date} 12:00:00`),
							booked: true,
							transaction: transactionResult._id
						}

						// create a new booking in the database
						db.insertOne(Booking, booking, function(bookingResult){
							if(bookingResult) {
								if(req.body.print_receipt == "")
									printEvent.emitPrintEvent(bookingResult._id);

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
            } else {
                res.redirect('/error');
            }
        });
	},

    checkBookingAvailability: function(req, res) {
		db.findOne(Room, {_id: req.query.roomID}, function(roomResult) {
			let rooms = [];
			rooms.push(req.query.roomID);
			if (roomResult && roomResult.connected_rooms) {
				for (let i = 0; i < roomResult.connected_rooms.length; i++) {
					rooms.push(roomResult.connected_rooms[i]);
				}
			}

			// extract dates and room numbers
	        let start = new Date(`${req.query.startDate} 14:00:00`);
	        let end = new Date(`${req.query.endDate} 12:00:00`);
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
						{$and: [
							{startDate: {$gte: start}},
							{startDate: {$lte: end}}
						]},
						{$and: [
							{endDate: {$gte: start}},
							{endDate: {$lte: end}}
						]},
						{$and: [
							{startDate: {$lte: start}},
							{endDate: {$gte: end}}
						]},
						{$and: [
							{startDate: {$gte: start}},
							{endDate: {$lte: end}}
						]}
					]}
				]
			};

			// when checking availability while editing booking, do not include itself as a conflicting booking
			if(req.query.bookingID != '') {
				query.$and.push({_id: {$ne: req.query.bookingID}});
			}

	        // find atleast one booking for a specified room between the start and end date inclusive
	        db.findOne(Booking, query, function(result) {
	            // a booking is found
	            if(result) {
	                res.send(false);
	            // no booking is found
	        	} else {
	                res.send(true);
	            }
	        });

		});
    },

	getRoom: function(req, res) {
		let roomID = req.query.roomID;

		db.findOne(Room, {_id: roomID}, function(result) {
			res.send(result);
		});
	},

	confirmReservation: function(req, res) {

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

		if(req.body.other_charges_arr)
			transaction.otherCharges = JSON.parse(req.body.other_charges_arr);

		db.insertOne(Transaction, transaction, function(transactionResult) {
		    if (transactionResult) {
				let reservation = {
		            $set: {
						//assign the guest to a room
						room: req.params.roomID,
						startDate: new Date (`${req.body.start_date} 14:00:00`),
		                endDate: new Date(`${req.body.end_date} 12:00:00`),
						//confirm the reservation
						booked: true,
						transaction: transactionResult._id
		            }
		        }
				//confirm the reservation, assign the guest to a room, and update the booking dates
				db.updateOne(Booking, {_id: req.body.reservation_select}, reservation, function (bookingResult) {

					if (bookingResult) {
						if(req.body.print_receipt == "")
                            printEvent.emitPrintEvent(bookingResult._id);

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
		    } else {
		        res.redirect('/error');
		    }
		});
	},

	getEditBooking: function(req, res) {
		//get the booking information given the bookingID
		db.findOne(Booking, {_id: req.params.bookingID}, function(result) {
			if (result) {

				let values = {
					username: req.session.username,
					booking: result
				}

				//render the edit booking screen
				res.render('booking-edit', values);
			} else {
				res.redirect('/error');
			}
		}, 'room guest transaction');
	},

	postEditBooking: function(req, res) {
		let booking = {
            $set: {
				startDate: new Date (`${req.body.start_date} 14:00:00`),
                endDate: new Date(`${req.body.end_date} 12:00:00`),
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
				if(req.body.print_receipt == "")
                    printEvent.emitPrintEvent(bookingResult._id);

                //update the customer details in the database
                db.updateOne(Guest, {_id: bookingResult.guest}, guest, function(guestResult) {
                    if (guestResult) {

						let transaction = {
							$set: {
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
						}

						if(req.body.other_charges_arr)
							transaction.$set.otherCharges = JSON.parse(req.body.other_charges_arr);

						db.updateOne(Transaction, {_id: bookingResult.transaction}, transaction, function(transactionResult) {
						    if (transactionResult) {

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

                        res.redirect(req.get('referer'));
                    } else {
                        res.redirect('/error');
                    }
                });
            } else {
                res.redirect('/error');
            }
        });
	},

	postPrintReceipt: function(req, res){
		db.findOne(Booking, {_id: req.params.bookingID}, function(booking_result){
			db.findOne(Guest, {_id: booking_result.guest}, function(guest_result){
				db.findOne(Transaction, {_id: booking_result.transaction}, function(transaction_result){
					db.findOne(Employee, {username: req.session.username}, function(employee_result){
						if(transaction_result){
							let flatFlag, percentFlag, seniorPwdFlag;
							let flatDisc, percentDisc, biggestDisc = 0;
							let discountDesc;

							flatFlag = transaction_result.additionalPhpDiscount.amount != null;
							percentFlag = transaction_result.additionalPercentDiscount.amount != null;
							seniorPwdFlag = transaction_result.pwdCount != null || transaction_result.seniorCitizenCount != null;

							if(flatFlag)
								flatDisc = transaction_result.additionalPhpDiscount.amount;

							if(percentFlag)
								percentDisc = (transaction_result.additionalPercentDiscount.amount / 100) * transaction_result.roomCost;

							if(flatDisc > percentDisc && flatFlag && percentFlag){
								discountDesc = "Flat Discount";
								biggestDisc = flatDisc;
							}
							else if(flatDisc < percentDisc && flatFlag && percentFlag) {
								discountDesc = "Percent Discount";
								biggestDisc = percentDisc;
							}
							else if(flatFlag && !percentFlag){
								discountDesc = "Flat Discount";
								biggestDisc = flatDisc;
							}
							else if(!flatFlag && percentFlag){
								discountDesc = "Percent Discount";
								biggestDisc = percentDisc;
							}

							if(transaction_result.totalDiscount > biggestDisc && seniorPwdFlag){
								discountDesc = 'Senior/PWD Discount';
								biggestDisc = transaction_result.totalDiscount;
							}

							renderObj = {
								guest: guest_result.firstName + " " + guest_result.lastName,
								checkin: booking_result.startDate.toLocaleString(),
								checkout: booking_result.endDate.toLocaleString(),
								receptionist: employee_result.first_name + " " + employee_result.last_name,
								roomCost: transaction_result.roomCost,
								subtotal: transaction_result.totalCharges,
								totalDiscount: biggestDisc,
								total: transaction_result.netCost,
								payment: transaction_result.payment,
								change: transaction_result.balance
							}

							if(flatFlag || percentFlag || seniorPwdFlag)
								renderObj["appliedDiscount"] = discountDesc;
							
							if(transaction_result.extraCharges != null)
								renderObj["extraCharges"] = transaction_result.extraCharges;

							res.render('print', renderObj);
						}
					})
				})
			})
		})
	}

}

module.exports =  bookingController;
