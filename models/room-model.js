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
            type: Number
        },

        monthly: {
            type: [Number],
        }
    },

    max_pax: {
        type: Number,
        required: true
    },

    // signifies whether the room needs housekeeping or not
    need_housekeeping: {
        type: Boolean,
        required: true
    },

    // signifies whether the room needs repair or not
    need_repair: {
        type: Boolean,
        required: true
    },

    // signifies whether the room is vacant or occupied
    availability_status: {
        type: String,
        trim: true,
        required: true
    },

    connected_rooms: {
        type: [{
            type: mongoose.ObjectId,
            ref: 'Room'
        }]
    }
});

module.exports = mongoose.model('Room', RoomSchema);
