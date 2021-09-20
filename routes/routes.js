const express = require('express');
const errorController = require('../controllers/error-controller.js');
const signInController = require('../controllers/sign-in-controller.js');
const calendarController = require('../controllers/calendar-controller.js');
const reservationController = require('../controllers/reservation-controller.js');
const bookingController = require('../controllers/booking-controller.js');
const roomManagementController = require('../controllers/room-management-controller.js');

const app = express.Router();

// renders the sign in page
app.get('/', signInController.getSignIn);

// submits the sign in form
app.post('/sign-in', signInController.postSignIn);

// signs out user
app.get('/sign-out', signInController.getSignOut);

// renders the calendar page for a specific month and year
app.get('/calendar/:year-:month', calendarController.getCalendar);

// renders the reservation screen for a specific date
app.get('/:year-:month-:day/reservation', reservationController.getReservationScreen);

// renders the reservation creation screen
app.get('/:year-:month-:day/reservation/create', reservationController.getCreateReservation);

// finds a reservation document and sends it back as the result
app.get('/reservation', reservationController.getReservation);

// reservation detail form gets submitted
app.post('/reservation/create', reservationController.postCreateReservation);

// renders reservation editing screen for a specific reservation
app.get('/reservation/:bookingID/edit', reservationController.getEditReservation);

// submits reservation details after editing for a specific reservation
app.post('/reservation/:bookingID/edit', reservationController.postEditReservation);

// deletes a specific reservation
app.post('/reservation/:bookingID/delete', reservationController.postDeleteReservation);

// renders the booking screen
app.get('/:year-:month-:day/booking', bookingController.getBookingScreen);

// renders the booking creation screen
app.get('/:year-:month-:day/booking/:roomID/create', bookingController.getCreateBooking);

// submits the booking details
app.post('/booking/:roomID/create', bookingController.postCreateBooking);

// checks the database for conflicting bookings sending back true or false as its result
app.get('/booking/room/availability', bookingController.checkBookingAvailability);

// finds a booking document and sends it back as the result
app.get('/room', bookingController.getRoom)

// confirms a reservation
app.post('/booking/:roomID/confirm', bookingController.confirmReservation);

// renders booking editing page for a specific booking
app.get('/booking/:bookingID/edit', bookingController.getEditBooking);

// submits the new edited booking details
app.post('/booking/:bookingID/edit', bookingController.postEditBooking);

// deletes a specific booking
app.post('/booking/:bookingID/delete', bookingController.postDeleteBooking);

// renders the room management screen
app.get('/management', roomManagementController.getRoomManagement);

// renders the check-in page for a specific reservation
app.get('/management/:roomID/checkin/vacant', roomManagementController.getCheckInVacant);

// renders the check-in page for a vacant room
app.post('/management/:roomID/checkin/vacant/reservation', roomManagementController.postCheckInWithoutReservation);

// checks the database for conflicting bookings sending back true or false as its result
app.get('/checkin/room/availability', roomManagementController.checkCheckInAvailability);

// submits the check-in details for a vacant room
app.post('/management/:roomID/checkin/vacant/booking', roomManagementController.postCheckInWithoutBooking);

// submits the check-in details from the form
app.post('/management/:bookingID/checkin', roomManagementController.postCheckIn);

// performs database operations for when checking out
app.post('/management/:bookingID/checkout', roomManagementController.postCheckOut);

// redirects to form where fields are editable for any final modifications before checking out
app.get('/management/:bookingID/checkout', roomManagementController.getCheckOut);

// edit booking details for checked-in guests
app.get('/management/:bookingID/checkin/edit', roomManagementController.getEditCheckIn);

// submits booking details for checked-in guests after editing
app.post('/management/:bookingID/checkin/edit', roomManagementController.postEditCheckIn);

// renders screen where you can transfer rooms
app.get('/management/:bookingID/transfer', roomManagementController.getTransfer);

// applies necessary changes to database for transfer
app.post('/management/:bookingID/transfer', roomManagementController.postTransfer);

// renders screen where you can change room statuses
app.get('/management/:roomID/maintenance', roomManagementController.getRoomMaintenance);

// selected statuses are applied in the database
app.post('/management/:roomID/maintenance', roomManagementController.postRoomMaintenance);

// renders the receipt
app.get('/booking/:bookingID/print', bookingController.postPrintReceipt);

// loads a preview of the receipt
app.get('/print', bookingController.getPrint);

// redirects to error page
app.get(`/error`, errorController.getError);

// unknown routes get redirected to error page
app.get(`/*`, errorController.getError);

app.post(`/*`, errorController.getError);

module.exports = app;
