const express = require('express');
const controller = require('../controllers/controller.js');
const signInController = require('../controllers/sign-in-controller.js');
const calendarController = require('../controllers/calendar-controller.js');
const reservationController = require('../controllers/reservation-controller.js');

const app = express.Router();

app.get('/', signInController.getSignIn);
app.post('/sign-in', signInController.postSignIn);
app.get('/sign-out', signInController.getSignOut);
app.get('/index', controller.getIndex);

app.get('/calendar/:year-:month', calendarController.getCalendar);

app.get('/reservation/:year-:month-:day', reservationController.getReservationScreen);

app.get('/reservation/:year-:month-:day/create', reservationController.getCreateReservation);

// reservation detail form gets submitted
app.post('/reservation/create', reservationController.postCreateReservation);

app.get('/reservation-edit', controller.getEditReservation);

module.exports = app;
