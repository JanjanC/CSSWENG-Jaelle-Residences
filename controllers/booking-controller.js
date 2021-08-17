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
    }
}

module.exports =  bookingController;