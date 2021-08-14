var mongoose = require('mongoose');

var GuestSchema = new mongoose.Schema ({
    // the guest's first name
    first_name: {
        type: String,
        required: true
    },

    // the guest's last name
    last_name: {
        type: String,
        required: true
    },

    // the guest's birthday
    birthdate: {
        type: Date
    },

    // the guest's address
    address: {
        type: String
    },

    // the guest's contact number
    contact_number: {
        type: String
    },

    // the guest's company name
    company_name: {
        type: String
    },

    // the guest's occupation
    occupation: {
        type: String
    }
});

module.exports = mongoose.model('Guest', GuestSchema);
