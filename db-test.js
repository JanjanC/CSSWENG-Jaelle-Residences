//NOTE: This is only a temporary file to test if the db is functional

const db = require('./models/db.js');
const Activity = require('./models/activity-model.js');
const Booking = require('./models/booking-model.js');
const Employee = require('./models/employee-model.js');
const Guest = require('./models/guest-model.js');
const Receipt = require('./models/receipt-model.js');
const Room = require('./models/room-model.js');
const mongoose = require('mongoose');

const db_test = {
    execute: function () {

        let activity = {
            employee_id: mongoose.Types.ObjectId(),
            guest_id: mongoose.Types.ObjectId(),
            activity_type: "Check In",
            description: "Check In to Room 1",
            timestamp: new Date()
        }

        // db.insertOne(Activity, activity, function(){});

        let booking = {
          room_number: "1001",
          booked_rate: 500,
          booked_type: "Bat Cave",
          guest_id: new mongoose.Types.ObjectId(),
          employee_id: new mongoose.Types.ObjectId(),
          start_date: new Date(),
          end_date: new Date(),
          confirmed_reservation: true,
          checked_in: false
        }

        // db.insertOne(Booking, booking, function(){});

        let employee = {
            username: "myname",
            password:"123",
            first_name: "john",
            last_name: "doe",
            role: "staff",
            registered_by: "somename",
            date_registered: new Date()
        }

        // db.insertOne(Employee, employee, function(){});

        let guest = {
          first_name: "Bat",
          last_name: "Man",
          sex: "Male",
          birthdate: new Date(),
          address: "509 Testing Dee Bee Street",
          contact_number: "111222444888",
          emergency_contact_person: "Robin",
          emergency_contact_number: "911",
          company_name: "Bat Company",
          company_address: "Sa kanto",
          id_type: "Bat ID",
          id_number: "8886",
          id_expiration: new Date(),
          credit: 0.0
        }

        // db.insertOne(Guest, guest, function(){});

        let receipt = {
          guest_id: new mongoose.Types.ObjectId(),
          employee_id: new mongoose.Types.ObjectId(),
          booking_id: new mongoose.Types.ObjectId(),
          discount: {senior_discount: false, pwd_discount: true, additional_discount: 12},
          breakdown: [{detail: "Test1", price: 37}, {detail: "Test2", price: 43}],
          total_price: 69.96,
          timestamp: new Date()
        }

        // db.insertOne(Receipt, receipt, function(){});

        let room = {
            room_number: mongoose.Types.ObjectId(),
            room_type: "standard",
            room_rate: 69.69,
            need_housekeeping: true,
            need_repair: false,
            availability_status: "vacant"
        }

        db.insertOne(Room, room, function(){});



    }
}

module.exports = db_test;
