const express = require('express');
const controller = require('../controllers/controller.js');
const signInController = require('../controllers/sign-in-controller.js');
const calendarController = require('../controllers/calendar-controller.js');
const reservationController = require('../controllers/reservation-controller.js');
const bookingController = require('../controllers/booking-controller.js');

const app = express.Router();

app.get('/', signInController.getSignIn);
app.post('/sign-in', signInController.postSignIn);
app.get('/sign-out', signInController.getSignOut);
app.get('/index', controller.getIndex);

app.get('/calendar/:year-:month', calendarController.getCalendar);

app.get('/:year-:month-:day/reservation', reservationController.getReservationScreen);

app.get('/:year-:month-:day/reservation/create', reservationController.getCreateReservation);

app.get('/reservation', reservationController.getReservation);

// reservation detail form gets submitted
app.post('/reservation/create', reservationController.postCreateReservation);

app.get('/reservation/:bookingID/edit', reservationController.getEditReservation);
app.post('/reservation/:bookingID/edit', reservationController.postEditReservation);

app.post('/reservation/:bookingID/delete', reservationController.postDeleteReservation);

app.get('/:year-:month-:day/booking', bookingController.getBookingScreen);

app.get('/:year-:month-:day/booking/:roomID/create', bookingController.getCreateBooking);

app.post('/booking/:roomID/create', bookingController.postCreateBooking);

app.get('/room/availability', bookingController.checkAvailability)

app.get('/room', bookingController.getRoom)

app.post('/booking/:roomID/confirm', bookingController.confirmReservation);

app.get(`/error`, controller.getError);
app.get(`/*`, controller.getError);
app.post(`/*`, controller.getError);
module.exports = app;
