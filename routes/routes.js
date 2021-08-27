const express = require('express');
const errorController = require('../controllers/error-controller.js');
const signInController = require('../controllers/sign-in-controller.js');
const calendarController = require('../controllers/calendar-controller.js');
const reservationController = require('../controllers/reservation-controller.js');

const app = express.Router();

app.get('/', signInController.getSignIn);

app.post('/sign-in', signInController.postSignIn);

app.get('/sign-out', signInController.getSignOut);

app.get('/calendar/:year-:month', calendarController.getCalendar);

app.get('/:year-:month-:day/reservation', reservationController.getReservationScreen);

app.get('/:year-:month-:day/reservation/create', reservationController.getCreateReservation);

// reservation detail form gets submitted
app.post('/reservation/create', reservationController.postCreateReservation);

app.get('/reservation/:bookingID/edit', reservationController.getEditReservation);

app.post('/reservation/:bookingID/edit', reservationController.postEditReservation);

app.post('/reservation/:bookingID/delete', reservationController.postDeleteReservation);

app.get(`/error`, errorController.getError);

app.get(`/*`, errorController.getError);

app.post(`/*`, errorController.getError);

module.exports = app;
