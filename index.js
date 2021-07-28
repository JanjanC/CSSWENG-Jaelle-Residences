const dotenv = require('dotenv');
const mongoose = require('mongoose');
const db = require('./models/db.js');

db.connect();


//NOTE: This is only a temporary code to test if the db is functional
//test if the database is functional
const db_test = require('./db-test.js');
db_test.execute();
