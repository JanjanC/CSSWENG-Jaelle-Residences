var mongoose = require('mongoose');

var TransactionSchema = new mongoose.Schema({

    //the duration of the stay in the hotel
    duration: {
        type: Number,
        required: true
    },

    //the average daily rate the room
    averageRate: {
        type: Number,
        required: true
    },

    //the number of guest staying in the room
    pax: {
        type: Number,
        required: true
    },

    //the number of PWD in the guest list
    pwdCount: {
        type: Number
    },

    //the number of senior citizens in the guest list
    seniorCitizenCount: {
        type: Number
    },

    //the additional discount given to the guest in PHP
    additionalPhpDiscount: {
        //the reason for giving the discount
        reason: {
            type: String,
            trim: true
        },

        //the discount given in PHP
        amount: {
            type: Number
        }
    },

    //the additional discount given to the guest in percent
    additionalPercentDiscount: {
        //the reason for giving the discount
        reason: {
            type: String,
            trim: true
        },

        //the discount given in percent
        amount: {
            type: Number
        }
    },


    // the charges for each guest that is over the maximum number of guest for the room
    extraPaxCharges: {
        //the number of extra guest
        count: {
            type: Number
        },

        //the extra charges to be paid for the extra guest
        amount: {
            type: Number
        }
    },

    //the charges for requesting an extra bed for the rooom
    extraBedCharges: {
        //the number of beds requested
        count: {
            type: Number
        },
        // the extra charges for the extra bed
        amount: {
            type: Number
        }
    },

    //the charges for bringng a pet to the hotel
    extraPetCharges: {
        type: Number
    },

    //other charges that may be incurred by the guest
    otherCharges: {
        type:[{
            //the reason for incurring the charges
            reason: {
                type: String,
                trim: true
            },

            //the amount to be paid by the customer in PHP
            amount: {
                type: Number
            }
        }]
    },

    //the amount to be paid for the room for the duration of the stay of the guest
    roomCost: {
        type: Number,
        required: true
    },

    //the total discount that is to be given to the guest
    totalDiscount: {
        type: Number,
        required: true
    },

    //the total charges that is incurred by the guest
    totalCharges: {
        type: Number,
        required: true
    },

    //the total amount to be paid by the guest with the discount and charges applied
    netCost: {
        type: Number,
        required: true
    },

    //the amount paid by the guest to the hotel
    payment: {
        type: Number,
        required: true
    },

    //the remaining balance that is yet to be paid by the customer
    balance: {
        type: Number,
        required: true
    }
});

module.exports = mongoose.model('Transaction', TransactionSchema);
