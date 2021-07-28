var mongoose = require('mongoose');

var ActivitySchema = new mongoose.Schema({
    // the ObjectID of the employee who committed the action
    employee_id: {
        type: mongoose.ObjectId,
        required: true
    },

    // the ObjectID of the guest that was affected by the action if applicable
    guest_id: {
        type: mongoose.ObjectId,
        required: true
    },

    // the type of action taken
    activity_type: {
        type: String,
        required: true
    },

    // a description giving more details reagrding the action
    description: {
        type: String,
        required: true
    },

    // the time and date when the action was committed
    timestamp: {
        type: Date,
        required: true
    }
});

module.exports = mongoose.model('Activity', ActivitySchema);
