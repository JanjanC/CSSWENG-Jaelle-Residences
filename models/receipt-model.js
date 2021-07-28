var mongoose = require('mongoose');

var ReceiptSchema = new mongoose.Schema({
    // the ObjectID of the guest the receipt is intended for
    guest_id: {
        type: mongoose.ObjectId,
        required: true
    },

    // the ObjectID of the employee who checked-out the guest
    employee_id: {
        type: mongoose.ObjectId,
        required: true
    },

    // the ObjectID of the booking the receipt is intended for
    booking_id: {
        type: mongoose.ObjectId,
        required: true
    },

    // an object signifying which discounts apply to the transaction
    discount: {
        senior_discount: {
            type: Boolean,
            required: true
        },

        pwd_discount: {
            type: Boolean,
            required: true
        },

        additional_discount: {
            type: Number,
            required: true
        }
    },

    // an array of items which serve as the breakdown in the receipt
    breakdown: {
        type: [{
            detail: {
                type: String,
                required: true
            },

            price: {
                type: Number,
                required: true
            }
        }],
        required: true
    },

    // the total price
    total_price: {
        type: Number,
        required: true
    },

    // the time the guest was checked out
    timestamp: {
        type: Date,
        required: true
    }
});

module.exports = mongoose.model('Receipt', ReceiptSchema);
