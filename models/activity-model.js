var mongoose = require('mongoose');

var ActivitySchema = new mongoose.Schema({
    // the ObjectID of the employee who performed the action
    employee: {
        type: mongoose.ObjectId,
        required: true,
        ref: 'Employee'
    },

    // the ObjectID of the booking that was created or modified by the employee
    booking: {
        type: mongoose.ObjectId,
        required: true,
        ref: 'Booking'
    },

    // the type of action taken
    activity_type: {
        type: String,
        required: true
    },

    // the time and date when the action was performed
    timestamp: {
        type: Date,
        required: true
    }
});

module.exports = mongoose.model('Activity', ActivitySchema);
