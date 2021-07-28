const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();
const url = process.env.DB_URL;

const Activity = require('./activity-model.js');
const Booking = require('./booking-model.js');
const Employee = require('./employee-model.js');
const Guest = require('./guest-model.js');
const Receipt = require('./receipt-model.js');
const Room = require('./room-model.js');

// additional connection options
const options = {
    useUnifiedTopology: true,
    useNewUrlParser: true
};

const database = {

    //connect to the database
    connect: function () {
        mongoose.connect(url, options, function(err) {
            if(err) throw err;
            console.log('Connected to: ' + url);
        });
    },

    //insert a single 'doc' to the database based on the model 'model'
    insertOne: function(model, doc, callback) {
        model.create(doc, function(err, res) {
            if(err) throw err;
            console.log('Added ' + res);
            return callback(res);
        });
    },

    //insert a multiple 'doc' to the database based on the model 'model'
    insertMany: function(model, docs, callback) {
        model.insertMany(docs, function(err, res) {
            if(err) throw err;
            console.log('Added ' + res);
            return callback(res);
        });
    },

    //searches for a single document in the database based on the model 'model' filtered by the object 'query'
    findOne: function(model, query, callback, projection='') {
        model.findOne(query, projection, function(err, res) {
            if(err) throw err;
            return callback(res);
        });
    },

    //searches for multiple documents in the database based on the model 'model' filtered by the object 'query'
    findMany: function(model, query, callback, projection='', sort=null) {
        model.find(query, projection).sort(sort).exec(function (err, res) {
            if(err) throw err;
            return callback(res);
        });
    },

    //updates the value of a single document with the object 'update' in the database based on the model 'model' filtered by the object 'filter'
    updateOne: function(model, filter, update, callback) {
        model.updateOne(filter, update, function(err, res) {
            if(err) throw err;
            console.log('Document modified: ' + res.nModified);
            return callback(res);
        });
    },

    //updates the value of multiple documents with the object 'update' in the database based on the model 'model' filtered by the object 'filter'
    updateMany: function(model, filter, update, callback) {
        model.updateMany(filter, update, function(err, res) {
            if(err) throw err;
            console.log('Documents modified: ' + res.nModified);
            return callback(res);
        });
    },

    //deletes a single document in the database based on the model 'model' filtered by the object 'conditions'
    deleteOne: function(model, conditions, callback) {
        model.deleteOne(conditions, function (err, res) {
            if(err) throw err;
            console.log('Document deleted: ' + res.deletedCount);
            return callback(res);
        });
    },

    //deletes multiple document in the database based on the model 'model' filtered by the object 'conditions'
    deleteMany: function(model, conditions, callback) {
        model.deleteMany(conditions, function (err, res) {
            if(err) throw err;
            console.log('Document deleted: ' + res.deletedCount);
            return callback(res);
        });
    }

}

module.exports = database;
