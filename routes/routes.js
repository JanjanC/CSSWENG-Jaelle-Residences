const express = require('express');
const controller = require('../controllers/controller.js');
const signInController = require('../controllers/sign-in-controller.js')
const reservationController = require('../controllers/reservation-controller.js')

const app = express.Router();

app.get('/', signInController.getSignIn);
app.post('/sign-in', signInController.postSignIn);
app.get('/index', controller.getIndex);

app.get('/reservation/:month-:day-:year', reservationController.getReservationScreen);

app.get('/create-reservation', controller.getCreateReservation);

// reservation detail form gets submitted
app.post('/create-reservation', reservationController.postCreateReservation);


module.exports = app;
