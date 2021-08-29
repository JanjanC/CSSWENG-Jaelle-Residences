var mongoose = require('mongoose');

var BookingSchema = new mongoose.Schema({
    // the room number for the booking
    // this field is absent when a booking is merely reserved (i.e., the reservation has not been paid for)
    room: {
        type: mongoose.ObjectId,
        ref: 'Room'
    },

    // the room rate at the time of booking
    booked_rate: {
        type: Number,
    },

    // the type of room booked
    booked_type: {
        type: String,
        trim: true,
        required: true
    },

    // the ObjectID of the guest who made the booking
    guest: {
        type: mongoose.ObjectId,
        required: true,
        ref: 'Guest'
    },

    // the ObjectID of the employee who processed the booking
    employee: {
        type: mongoose.ObjectId,
        required: true,
        ref: 'Employee'
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

    // signifies whether it is a reservation or not
    reserved: {
        type: Boolean,
        required: true
    },

    // signifies whether it is a booking or not
    booked: {
        type: Boolean,
        required: true
    },

    // signifies whether the guest has checked in or not
    checked_in: {
        type: Boolean,
        required: true
    },

    is_cancelled: {
        type: Boolean,
        required: true
    }

});

module.exports = mongoose.model('Booking', BookingSchema);
