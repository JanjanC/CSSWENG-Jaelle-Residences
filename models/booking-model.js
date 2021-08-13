var mongoose = require('mongoose');

var BookingSchema = new mongoose.Schema({
    // the room number for the booking
    // this field is absent when a booking is merely reserved (i.e., the reservation has not been paid for)
    room_number: {
        type: String
    },

    // the room rate at the time of booking
    booked_rate: {
        type: Number,
    },

    // the type of room booked
    booked_type: {
        type: String,
        required: true
    },

    // the ObjectID of the guest who made the booking
    guest_id: {
        type: mongoose.ObjectId,
        required: true
    },

    // the ObjectID of the employee who processed the booking
    employee_id: {
        type: mongoose.ObjectId,
        required: true
    },

    // the day the booking starts
    start_date: {
        type: Date,
        required: true
    },

    // the day the booking ends
    end_date: {
        type: Date,
        required: true
    },

    // signifies whether or not a reservation has been confirmed (i.e., the reservation has beem paid for)
    // this field is absent when the a booking is made without prior reservation
    confirmed_reservation: {
        type: Boolean
    },

    // signifies whether the guest has checked in or not
    checked_in: {
        type: Boolean
    }

});

module.exports = mongoose.model('Booking', BookingSchema);
