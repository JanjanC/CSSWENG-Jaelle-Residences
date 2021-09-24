//imports the necessary modules
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
	//render printing page
	getPrint: function(req, res) {
		res.render('print');
	},

	//load the booking screen page along with the current booked and checked in rooms
	getBookingScreen: function (req, res) {
		let today = new Date();
		//get the date today  as the default date in the form of YYYY/MM/DD
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

		//a date is given as part of the query
		if (req.params.year !== undefined && req.params.month !== undefined && req.params.day !== undefined) {
			//reformat the date in the form of YYYY-MM-DD
			dateString = `${req.params.year}-${req.params.month}-${req.params.day}`;
		}

		//form the current date and time by concatening the date and time string
		let date = new Date(`${dateString} ${fullTimeString}`);

		//find all the rooms in the database
		db.findMany(Room, {}, function (roomResult) {

			if (roomResult) {

				//an array containing the list of rooms
				let list = [];
				//transform the list of rooms into an object so that a booking may be later linked to a room
				for (let i = 0; i < roomResult.length; i++) {
					let room = {
						room: roomResult[i],
						booking: {}
					}
					list.push(room);
				}

				//the list of conditions that are to bet in the query
				let booking = {
					//the current date is between the start date and end date of the booking, inclusive
		            startDate: {$lte: date},
		            endDate: {$gte: date},
					//the booking is currently either booked or checked in
					$or: [
		            	{booked: true},
                        {checkedIn: true}
					],
					//the booking is neither checked our nor checked in
					checkedOut: false,
					isCancelled: false
		        };

				//find all the bookings that matches the conditions specified in the booking variable
				db.findMany(Booking, booking, function (bookingResult) {
		        	if (bookingResult) {
						//loop through each matched
						for (let i = 0; i < bookingResult.length; i++) {
							//loop through each room in the database
							for (let j = 0; j < list.length; j++) {
								//check if the room of the booking matches the id of the room in the database
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

						//loads the main booking page along with the values object
						res.render('booking-main', values);
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

	//loads the create booking screen
	getCreateBooking: function(req, res) {
		//find the information of the room given a roomID
		db.findOne(Room, {_id: req.params.roomID}, function(roomResult) {
			if (roomResult) {

				//reformat the date specified in the url as YYYY-MM-DD
				let date = new Date(`${req.params.year}-${req.params.month}-${req.params.day}`);

				//the list of conditions that are to be met in the query
				let reservation = {
		            //the current date is equal to the start date while end date is later than the current date
					startDate: date,
 	               	endDate: {$gte: date},
					//the room type of the reservation matches the room type of the current room
					bookedType: roomResult.room_type,
					//the booking is currently reserved
		            reserved: true,
					booked: false,
					checkedIn: false,
					checkedOut: false,
		            isCancelled: false
		        };

				//find all the reservations such that the current date is equal to the start and end date is later than the current date
				db.findMany(Booking, reservation, function (reservationResult) {
					let values = {
						username: req.session.username,
	                    room: roomResult,
						reservations: reservationResult,
	                    date:date
	                }
					//render to create booking page along with the values in the value object
					res.render('booking-create', values);
				}, 'guest');
			} else {
				res.redirect('/error');
			}
		});
	},

	//saves the data from the create booking to the database
	postCreateBooking: function(req, res) {
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
						// collect the transaction information from post request that is to be stored to the database and set default booking start and end time
						let booking = {
							room: req.params.roomID,
							bookedType: req.body.room_type,
							guest: guestResult._id,
							employee: req.session.employeeID,
							//the start time is set to 2pm by default
							startDate: new Date (`${req.body.start_date} 14:00:00`),
							//the end time is set to 12pm by default
							endDate: new Date(`${req.body.end_date} 12:00:00`),
							booked: true,
							transaction: transactionResult._id
						}

						// stores the booking in the database
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
									activityType: 'Create Booking',
									timestamp: new Date()
								}

								//stores the activity of the employee to the database
								db.insertOne(Activity, activity, function(activityResult) {
									if (activityResult) {
										// redirects to home screen after adding a record
										res.redirect(`/${req.body.start_date}/booking/`);
									} else {
										//redirect to an error page if something went wrong
										res.redirect('/error');
									}
								});
							} else {
								//redirect to an error page if something went wrong
								res.redirect('/error');
							}
						});
				    } else {
						//redirect to an error page if something went wrong
				        res.redirect('/error');
				    }
				});
            } else {
				//redirect to an error page if something went wrong
                res.redirect('/error');
            }
        });
	},

	//checks the availability if the room is available on a specified date
    checkBookingAvailability: function(req, res) {
		//find the room information given the roomID
		db.findOne(Room, {_id: req.query.roomID}, function(roomResult) {
			// creates an array of rooms containing the current room and the connect rooms
			let rooms = [];
			//add the current room to the array
			rooms.push(req.query.roomID);
			//loops through each of the connected rooms
			if (roomResult && roomResult.connected_rooms) {
				//add the list of connected rooms to the array
				for (let i = 0; i < roomResult.connected_rooms.length; i++) {
					rooms.push(roomResult.connected_rooms[i]);
				}
			}

			// retrieves the start and end date from the query
	        let start = new Date(`${req.query.startDate} 14:00:00`);
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

	        // find atleast one booking for the specified room between the start and end date inclusive
	        db.findOne(Booking, query, function(result) {
	            // a booking is found
	            if(result) {
					//the room is not available for booking
	                res.send(false);
	            // no booking is found
	        	} else {
					//the room is avaialble for booking
	                res.send(true);
	            }
	        });

		});
    },

	//retrieve the information of the room from the database
	getRoom: function(req, res) {
		let roomID = req.query.roomID;

		//retrieve the information of the room given a room ID
		db.findOne(Room, {_id: roomID}, function(result) {
			// sends the Room entry back as response
			res.send(result);
		});
	},

	//confirm the reservation of the guest (i.e., convert the reservation to a booking)
	confirmReservation: function(req, res) {

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

		// an other charges field is included as part of the psot request
		if(req.body.other_charges_arr) {
			transaction.otherCharges = JSON.parse(req.body.other_charges_arr);
		}

		//stores the transaction to the database
		db.insertOne(Transaction, transaction, function(transactionResult) {
		    if (transactionResult) {

				// collect the reservation information from post request that is to be stored to the database
				let reservation = {
		            $set: {
						//assign the guest to a specific room
						room: req.params.roomID,
						//set the start time to 2pm by default and the end time to 12pm
						startDate: new Date (`${req.body.start_date} 14:00:00`),
		                endDate: new Date(`${req.body.end_date} 12:00:00`),
						//confirm the reservation by setting the booking variable to true
						booked: true,
						//updates the transaction ID of the booking
						transaction: transactionResult._id
		            }
		        }

				//update the booking information in the database with the contents as specified in the booking object
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

								//create an object indicating the activity of the user
								let activity = {
		                            employee: req.session.employeeID,
		                            booking: bookingResult._id,
		                            activityType: 'Confirm Reservation',
		                            timestamp: new Date()
		                        }
								//stores the action of the employee to an activity log
								db.insertOne(Activity, activity, function(activityResult) {
		                            if (activityResult) {
		                                // redirects to booking screen after adding a record
		                                res.redirect(`/${req.body.start_date}/booking/`);
		                            } else {
										//redirects to an error page in case an error occured
		                                res.redirect('/error');
		                            }
		                        });
							} else {
								//redirects to an error page in case an error occured
								res.redirect('/error');
							}
						});
					} else {
						//redirects to an error page in case an error occured
						res.redirect('/error');
					}
				});
		    } else {
				//redirects to an error page in case an error occured
		        res.redirect('/error');
		    }
		});
	},

	//loads the edit booking page along with the previously inputted information of the booking
	getEditBooking: function(req, res) {
		//retrieves the booking information from the database given the bookingID
		db.findOne(Booking, {_id: req.params.bookingID}, function(result) {
			if (result) {

				//stores the booking result and the current username of the employee in an object
				let values = {
					username: req.session.username,
					booking: result
				}

				//render the edit booking screen along with
				res.render('booking-edit', values);
			} else {
				//redirect to an error page in the event of an error
				res.redirect('/error');
			}
		}, 'room guest transaction');
	},

	//updates the booking information of the guest in the database
	postEditBooking: function(req, res) {

		// collect the booking information from post request that is to be stored to the database
		let booking = {
            $set: {
				startDate: new Date (`${req.body.start_date} 14:00:00`),
                endDate: new Date(`${req.body.end_date} 12:00:00`),
				pax: req.body.room_pax,
				payment: req.body.room_payment
            }
        }

        //update the booking details in the database with contents as specified in the booking object
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
				// opens print preview window if print receipt checkbox is ticked
				if(req.body.print_receipt == "") {
					printEvent.emitPrintEvent(bookingResult._id);
				}

                //update the customer details in the database
                db.updateOne(Guest, {_id: bookingResult.guest}, guest, function(guestResult) {
                    if (guestResult) {

						//collect the transaction details in the post request that is to be stored in the database
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

						// adds other charges field if it exists
						if(req.body.other_charges_arr) {
							transaction.$set.otherCharges = JSON.parse(req.body.other_charges_arr);
						}

						//update the transaction details with the information as specified in the transaction object
						db.updateOne(Transaction, {_id: bookingResult.transaction}, transaction, function(transactionResult) {
						    if (transactionResult) {

								//creates an activity object that records the activity of an employee
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
										//redirects to an error page in the event of an error
										res.redirect('/error');
									}
								});

						    } else {
								//redirects to an error page in the event of an error
						        res.redirect('/error');
						    }
						});
                    } else {
						//redirects to an error page in the event of an error
                        res.redirect('/error');
                    }
                });
            } else {
				//redirects to an error page in the event of an error
                res.redirect('/error');
            }
        });
	},

	//delete the previously created booking of a guest
	postDeleteBooking: function(req, res) {
		// set booking status to cancelled
		let booking = {
            $set: {
                isCancelled: true
            }
        }

        //cancel the booking by setting isCancelled to true
        db.updateOne(Booking, {_id: req.params.bookingID}, booking, function(bookingResult) {

            if (bookingResult) {

				//creates an object that records the activity of the employee
                let activity = {
                    employee: req.session.employeeID,
                    booking: bookingResult._id,
                    activityType: 'Cancel Booking',
                    timestamp: new Date()
                }

                //saves the action of the employee to an activity log
                db.insertOne(Activity, activity, function(activityResult) {
                    if (activityResult) {
						//create a start date string in the form of YYYY-MM-DD
						let startDate = new Date(bookingResult.startDate);
                        let startDateString = `${startDate.getFullYear().toString()}-${(startDate.getMonth() + 1).toString().padStart(2, 0)}-${startDate.getDate().toString().padStart(2, 0)}`;

						//redirects to the previous page
                        res.redirect(req.get('referer'));
                    } else {
						//redirect to an error page in the event of an error
                        res.redirect('/error');
                    }
                });
            } else {
				//redirects to an error page in the event of an error
                res.redirect('/error');
            }
        });
	},

	//renders the print page along with the booking and transaction information
	postPrintReceipt: function(req, res){
		// retrieves the necessary records for receipt details
		// retrieves the booking information form the database
		db.findOne(Booking, {_id: req.params.bookingID}, function(booking_result) {
			//retrieves the guest information from the database
			db.findOne(Guest, {_id: booking_result.guest}, function(guest_result) {
				//retrieves the transaction information from the database
				db.findOne(Transaction, {_id: booking_result.transaction}, function(transaction_result) {
					//retrieves the employee infromation from the database
					db.findOne(Employee, {username: req.session.username}, function(employee_result) {
						if(transaction_result){
							let flatFlag, percentFlag, seniorPwdFlag;
							let flatDisc, percentDisc, biggestDisc = 0;
							let discountDesc;

							//identify the discount that was applied for the transaction
							flatFlag = transaction_result.additionalPhpDiscount.amount != null;
							percentFlag = transaction_result.additionalPercentDiscount.amount != null;
							seniorPwdFlag = transaction_result.pwdCount != null || transaction_result.seniorCitizenCount != null;

							// computes the amount of flat discount applied
							if(flatFlag) {
								flatDisc = transaction_result.additionalPhpDiscount.amount;
							}

							//compute the amount of percentage discount applied
							if(percentFlag) {
								percentDisc = (transaction_result.additionalPercentDiscount.amount / 100) * transaction_result.roomCost;
							}

							// check if a flat discount was applied to the transaction
							if(flatDisc > percentDisc && flatFlag && percentFlag){
								discountDesc = "Flat Discount";
								biggestDisc = flatDisc;
							}
							// check if a percent discount was applied to the transaction
							else if(flatDisc < percentDisc && flatFlag && percentFlag) {
								discountDesc = "Percent Discount";
								biggestDisc = percentDisc;
							}
							// check if a flat discount was applied to the transaction
							else if(flatFlag && !percentFlag){
								discountDesc = "Flat Discount";
								biggestDisc = flatDisc;
							}
							// check if a percent discount was applied to the transaction
							else if(!flatFlag && percentFlag){
								discountDesc = "Percent Discount";
								biggestDisc = percentDisc;
							}

							//check if a percent discount was applied to the transaction
							if(transaction_result.totalDiscount > biggestDisc && seniorPwdFlag){
								discountDesc = 'Senior/PWD Discount';
								biggestDisc = transaction_result.totalDiscount;
							}

							//create an object that stores the list of information that is to be loaded in the receipt and the printing page
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
								change: transaction_result.balance,
								otherCharges: transaction_result.otherCharges
							}

							//a discount was applied to the transaction
							if(flatFlag || percentFlag || seniorPwdFlag) {
								renderObj["appliedDiscount"] = discountDesc;
							}


							// adds extra charges fields if it exists
							if(transaction_result.extraCharges != null) {
								renderObj["extraCharges"] = transaction_result.extraCharges;
							}

							//renders the print page along with information specified in the renderObj object
							res.render('print', renderObj);
						}
					})
				})
			})
		})
	}

}

module.exports =  bookingController;
