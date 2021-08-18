const db = require('../models/db.js');
const Activity = require('../models/activity-model.js');
const Booking = require('../models/booking-model.js');
const Guest = require('../models/guest-model.js');
const Room = require('../models/room-model.js');
const mongoose = require('mongoose');

const bookingController = {
	getBookingScreen: function (req, res) {
		let date = new Date(`${req.params.year}-${req.params.month}-${req.params.day}`);

		let booking = {
			start_date: {$lte: date},
			end_date: {$gte: date},
			$or: [{confirmed_reservation: {$exists: false}},
				{confirmed_reservation: {$eq: true}}
			]
		};

		db.findMany(Booking, booking, function (result) {
			if (result) {

			}
		});

		res.render('booking-main', null);
	},

	getRoomBookingInfo: function (req, res) {

	},

	getRooms: function(req, res) {
		db.findMany(Room, null, function (result) {
			if(result) {
				var result = {
					rooms : result
				};

				result.rooms.sort((a, b) => (a.room_number > b.room_number) ? 1 : -1)

				res.send(result);
			}
		});
	},

	availableRooms: function(req, res){
		// extract dates and room type
		start = new Date("8/18/21");
		end = new Date("8/21/21");
		type = "Studio Type"

		// set conditions for the queries
		room_query ={
			room_type: type
		};

		booking_query = {
			booked_type: type,
			start_date: {$gte: start},
			end_date: {$lte: end},
			$or: [{confirmed_reservation: {$exists: false}},{confirmed_reservation: true}]
		};

		// find rooms of a specified type
		db.findMany(Room, room_query, function(room_result){
			if(room_result){
				// find bookings for rooms of the specified type between start and end date inclusive
				db.findMany(Booking, booking_query, function(booking_result){
					let rooms = [];
					// store room numbers in an array
					for(i = 0; i < room_result.length; i++){
						rooms.push(result[i].room_number);
					}

					// check if there are existing bookings for each room and
					// remove them from the array if bookings are found
					for(i = 0; i < rooms.length; i++){
						for(j = 0; j < booking_result.length; j++){
							if(booking_result[j].room_number == rooms[i]){
								rooms.splice(i,1);
								i--;
								break;
							}
						}
					}
					// Array rooms will contain the available rooms
				});
			}
		});
	},

	getBookingVacant: function(req, res) {
		res.render('booking-vacant');
	}
}

module.exports =  bookingController;
