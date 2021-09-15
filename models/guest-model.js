var mongoose = require('mongoose');

var GuestSchema = new mongoose.Schema ({
    // the guest's first name
    firstName: {
        type: String,
        trim: true,
        required: true
    },

    // the guest's last name
    lastName: {
        type: String,
        trim: true,
        required: true
    },

    // the guest's birthday
    birthdate: {
        type: Date
    },

    // the guest's address
    address: {
        type: String,
        trim: true
    },

    // the guest's contact number
    contact: {
        type: String,
        trim: true
    },

    // the guest's company name
    company: {
        type: String,
        trim: true
    },

    // the guest's occupation
    occupation: {
        type: String,
        trim: true
    }
});

module.exports = mongoose.model('Guest', GuestSchema);
