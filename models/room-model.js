var mongoose = require('mongoose');

var RoomSchema = new mongoose.Schema({

    // the room number for this room
    room_number: {
        type: Number,
        required: true
    },

    // the type of room
    room_type: {
        type: String,
        trim: true,
        required: true
    },

    // the rate the room
    room_rate: {
        //the daily rate of the room
        daily: {
            type: Number,
            required: true
        },

        //the weekly rate of the room
        weekly: {
            type: Number,
            required: true,
            default: 0
        },

        //the monthly rate of the room
        monthly: {
            type: [Number],
            required: true,
            default: [0]
        }
    },

    //the maximum number of person allowed for the room
    max_pax: {
        type: Number,
        required: true
    },

    //the list of rooms connected to the current room
    connected_rooms: {
        type: [{
            type: mongoose.ObjectId,
            ref: 'Room'
        }]
    },

    // signifies whether the room needs housekeeping or not
    needHousekeeping: {
        type: Boolean,
        required: true,
        default: false
    },

    // signifies whether the room needs repair or not
    needRepair: {
        type: Boolean,
        required: true,
        default: false
    },
});

module.exports = mongoose.model('Room', RoomSchema);
