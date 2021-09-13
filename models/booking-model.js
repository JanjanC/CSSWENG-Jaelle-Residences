var mongoose = require('mongoose');

var BookingSchema = new mongoose.Schema({
    // the room number for the booking
    // this field is absent when a booking is merely reserved (i.e., the reservation has not been paid for)
    room: {
        type: mongoose.ObjectId,
        ref: 'Room'
    },

    // the type of room booked
    bookedType: {
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
    startDate: {
        type: Date,
        required: true
    },

    // the day the booking ends
    endDate: {
        type: Date,
        required: true
    },

    // signifies whether it is a reservation or not
    reserved: {
        type: Boolean,
        required: true,
        default: false
    },

    // signifies whether it is a booking or not
    booked: {
        type: Boolean,
        required: true,
        default: false
    },

    // signifies whether the guest has checked in or not
    checkedIn: {
        type: Boolean,
        required: true,
        default: false
    },

    // signifies whether the guest has checked out or not
    checkedOut: {
        type: Boolean,
        required: true,
        default: false
    },

    // signifies whether the booking has been cancelled or not
    isCancelled: {
        type: Boolean,
        required: true,
        default: false
    },

    transaction: {
        type: mongoose.ObjectId,
        ref: 'Transaction'
    }

});

module.exports = mongoose.model('Booking', BookingSchema);