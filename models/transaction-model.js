var mongoose = require('mongoose');

var TransactionSchema = new mongoose.Schema({

    duration: {
        type: Number,
        required: true
    },

    averageRate: {
        type: Number,
        required: true
    },

    roomCost: {
        type: Number,
        required: true
    },

    pax: {
        type: Number,
        required: true
    },

    pwdCount: {
        type: Number
    },

    seniorCitizenCount: {
        type: Number
    },

    additionalPhpDiscount: {
        reason: {
            type: String,
            trim: true
        },

        amount: {
            type: Number
        }
    },

    additionalPercentDiscount: {
        reason: {
            type: String,
            trim: true
        },

        amount: {
            type: Number
        }
    },

    totalDiscount: {
        type: Number,
        required: true
    },

    extraCharges: {
        type: Number
    },

    totalCharges: {
        type: Number,
        required: true
    },

    netCost: {
        type: Number,
        required: true
    },

    payment: {
        type: Number,
        required: true
    },

    balance: {
        type: Number,
        required: true
    }
});

module.exports = mongoose.model('Transaction', TransactionSchema);
