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

    // the guest's sex
    sex: {
        type: String,
        required: true
    },

    // the guest's birthday
    birthdate: {
        type: Date,
        required: true
    },

    // the guest's address
    address: {
        type: String,
        required: true
    },

    // the guest's contact number
    contact_number: {
        type: String,
        required: true
    },

    // the guest's emergency contact person
    emergency_contact_person: {
        type: String,
        required: true
    },

    // the guest's emergency contact number
    emergency_contact_number: {
        type: String,
        required: true
    },

    // the guest's company name
    company_name: {
        type: String,
        // required: true
    },

    // the guest's company address
    company_address: {
        type: String,
        // required: true
    },

    // the type of id the guest presented
    id_type: {
        type: String,
        required: true
    },

    // the id number in the guest's id
    id_number: {
        type: String,
        required: true
    },

    // the expiration date of the id presented
    id_expiration: {
        type: Date,
        required: true
    },

    // the guest's remaining credit
    credit: {
        type: Number,
        required: true,
        default: 0
    },
});

module.exports = mongoose.model('Guest', GuestSchema);
