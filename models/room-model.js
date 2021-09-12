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

    // the current rate the room goes for
    room_rate: {
        daily: {
            type: Number,
            required: true
        },

        weekly: {
            type: Number,
            required: true,
            default: 0
        },

        monthly: {
            type: [Number],
            required: true,
            default: [0]
        }
    },

    max_pax: {
        type: Number,
        required: true
    },

    connected_rooms: {
        type: [{
            type: mongoose.ObjectId,
            ref: 'Room'
        }]
    },

    // signifies whether the room needs housekeeping or not
    housekeeping: {
        type: String,
        required: true,
        default: 'Okay'
    },

    // signifies whether the room needs repair or not
    repair: {
        type: String,
        required: true,
        default: 'Okay'
    },
});

module.exports = mongoose.model('Room', RoomSchema);
