var mongoose = require('mongoose');

var ChargeSchema = new mongoose.Schema({
    reason: {
        type: String,
        trim: true
    },

    amount: {
        type: Number
    }
});

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

    extraPaxCharges: {
        type: Number
    },

    extraBedCharges: {
        type: Number
    },

    extraPetCharges: {
        type: Number
    },

    otherCharges: {
        type:[ChargeSchema]
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
