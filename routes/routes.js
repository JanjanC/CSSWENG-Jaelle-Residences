const express = require('express');
const controller = require('../controllers/controller.js');
const reservationController = require('../controllers/reservation-controller.js')

const app = express.Router();

app.get('/', controller.getIndex);
app.get('/reservation-main', controller.getReservationMain);
app.get('/reservation-add', controller.getReservationAdd);
module.exports = app;
