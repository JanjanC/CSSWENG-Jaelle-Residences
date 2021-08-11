const express = require('express');
const controller = require('../controllers/controller.js')

const app = express.Router();

app.get('/', controller.getIndex);
app.get('/reservation-main', controller.getReservationMain);
module.exports = app;
