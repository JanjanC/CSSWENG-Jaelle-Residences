const assert = require('assert');
const expect = require('chai').expect
const request = require('supertest');
const express = require('express');
const app = require('../server.js');

describe('Unit testing the GET /:year-:month-:day/booking', function() {
    it('should extract the correct date from the route', function() {
        testDate = 'AUG. 02, 2021';
        return request(app)
            .get('/2021-08-02/booking/')
            .then(function(response){
                expect(response.text).to.contain(testDate);
            })
    });

    it('should display the correct bookings for the specified date', function() {
        let testBookingStatus = `<h5 class="ms-4 text-secondary room-field"><span id="room-611a2b62687236173c223af2-status">Booked</span></h5>`;
        let testBookingType = `<h5 class="ms-4 text-secondary room-field"><span id="room-611a2b62687236173c223af2-type">Twin Bed</span></h5>`;
        let testBookingRate = `<h5 class="ms-4 text-secondary room-field"><span id="room-611a2b62687236173c223af2-rate">2200 Php/Day</span></h5>`;
        return request(app)
            .get('/2021-08-30/booking')
            .then(function(response){
                expect(response.text).to.contain(testBookingStatus).and.contain(testBookingType).and.contain(testBookingRate);
            })
    });
});

describe('Unit testing the GET /:year-:month-:day/booking/:roomID/create route', function() {
    it('should retrieve the correct room type', function() {
        return request(app)
            .get('/2021-08-30/booking/611a2b62687236173c223ae2/create')
            .then(function(response){
                expect(response.text).to.contain('Studio Type');
            })
    });

    it('should retrieve the correct room number', function() {
        return request(app)
            .get('/2021-08-30/booking/611a2b62687236173c223ae2/create')
            .then(function(response){
                expect(response.text).to.contain('407');
            })
    });

    it('should extract the correct date from the route and set it as start date', function() {
        testDate = `value="2021-08-30"`;
        return request(app)
            .get('/2021-08-30/booking/611a2b62687236173c223ae2/create')
            .then(function(response){
                expect(response.text).to.contain(testDate);
            })
    });
});

describe('Unit testing the GET /room/availability route', function() {
    it('should return true if room is available', function() {
        let query = {
            start_date: '2021-08-30',
            end_date: '2021-09-01',
            // room 407
            rooms: ['611a2b62687236173c223ae2'],
        }
        return request(app)
            .get('/room/availability')
            .query(query)
            .then(function(response){
                expect(response.body).to.equal(true);
            })
    });

    it('should return false if room is not available', function() {
        let query = {
            start_date: '2021-08-30',
            end_date: '2021-09-01',
            // room 302
            rooms: ['611a2b62687236173c223af2'],
        }
        return request(app)
            .get('/room/availability')
            .query(query)
            .then(function(response){
                expect(response.body).to.equal(false);
            })
    });
});

describe('Unit testing the GET /room route', function() {
    it('should return the correct room', function() {
        return request(app)
          .get('/room')
          .query({roomID: '611a2b62687236173c223ae2'})
          .then(function(response){
              expect(response.body).to.deep.include({room_number: 407});
          })
      });
});

describe('Unit testing the GET /booking/:bookingID/edit route', function() {
    it('should retrieve the correct room type', function() {
        return request(app)
            .get('/booking/612335538a46aa23341f8b84/edit')
            .then(function(response){
                expect(response.text).to.contain('Twin Bed');
            })
    });

    it('should retrieve the correct room number', function() {
        return request(app)
            .get('/booking/612335538a46aa23341f8b84/edit')
            .then(function(response){
                expect(response.text).to.contain('302');
            })
    });

    it('should retrieve the correct dates from the booking', function() {
        testStart = `value="2021-08-26"`;
        testEnd = `value="2021-08-31"`;
        return request(app)
            .get('/booking/612335538a46aa23341f8b84/edit')
            .then(function(response){
                expect(response.text).to.contain(testStart).and.contain(testEnd);
            })
    });

    it('should retrieve the correct first name from the booking', function() {
        return request(app)
            .get('/booking/612335538a46aa23341f8b84/edit')
            .then(function(response){
                expect(response.text).to.contain('Leeroy');
            })
    });

    it('should retrieve the correct last name from the booking', function() {
        return request(app)
            .get('/booking/612335538a46aa23341f8b84/edit')
            .then(function(response){
                expect(response.text).to.contain('Jenkins');
            })
    });
});