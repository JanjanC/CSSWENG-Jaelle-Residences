var mongoose = require('mongoose');

var EmployeeSchema = new mongoose.Schema({

    // the employee's username
    username: {
        type: String,
        required: true
    },

    // the employee's password
    password: {
        type: String,
        required: true
    },

    // the employee's first name
    first_name: {
        type: String,
        trim: true,
        required: true
    },

    // the employee's first name
    last_name: {
        type: String,
        trim: true,
        required: true
    },

    // the employee's role (staff or admin)
    role: {
        type: String,
        required: true
    },

    // the date the employee was registered
    date_registered: {
        type: Date,
        required: true
    }
});

module.exports = mongoose.model('Employee', EmployeeSchema);
