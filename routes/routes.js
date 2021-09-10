const express = require('express');
const errorController = require('../controllers/error-controller.js');
const signInController = require('../controllers/sign-in-controller.js');
const calendarController = require('../controllers/calendar-controller.js');
const reservationController = require('../controllers/reservation-controller.js');
const bookingController = require('../controllers/booking-controller.js');
const roomManagementController = require('../controllers/room-management-controller.js');

const app = express.Router();

app.get('/', signInController.getSignIn);

app.post('/sign-in', signInController.postSignIn);

app.get('/sign-out', signInController.getSignOut);

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

app.get('/booking/room/availability', bookingController.checkBookingAvailability);

app.get('/room', bookingController.getRoom)

app.post('/booking/:roomID/confirm', bookingController.confirmReservation);

app.get('/booking/:bookingID/edit', bookingController.getEditBooking);

app.post('/booking/:bookingID/edit', bookingController.postEditBooking);

app.post('/booking/:bookingID/delete', bookingController.postDeleteBooking);

app.get('/management', roomManagementController.getRoomManagement);

app.get('/management/:roomID/checkin/vacant', roomManagementController.getCheckInVacant);

app.post('/management/:roomID/checkin/vacant/reservation', roomManagementController.postCheckInWithoutReservation);

app.get('/checkin/room/availability', roomManagementController.checkCheckInAvailability);

app.post('/management/:roomID/checkin/vacant/booking', roomManagementController.postCheckInWithoutBooking);

app.post('/management/:bookingID/checkin', roomManagementController.postCheckIn);

app.post('/management/:bookingID/checkout', roomManagementController.postCheckOut);

app.get('/management/:bookingID/checkin/edit', roomManagementController.getEditCheckIn);

app.post('/management/:bookingID/checkin/edit', roomManagementController.postEditCheckIn);

app.get(`/error`, errorController.getError);

app.get(`/*`, errorController.getError);

app.post(`/*`, errorController.getError);

module.exports = app;
