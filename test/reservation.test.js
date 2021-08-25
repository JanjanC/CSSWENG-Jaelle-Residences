const assert = require('assert');
const expect = require('chai').expect
const request = require('supertest');
const express = require('express');
const app = require('../server.js');

describe('Unit testing the /:year-:month-:day/reservation route', function() {
    it('should extract the correct date from the route', function() {
        testDate = 'AUG. 02, 2021';
        return request(app)
            .get('/2021-08-02/reservation/')
            .then(function(response){
                expect(response.text).to.contain(testDate);
            })
    });

    it('should display the correct reservations for the specified date', function() {
        list = ["6125bd0ba9256232e45f9e0c", "6125bd0ba9256232e45f9e0c"];
        list2 = ['id="reservation-6125bd0ba9256232e45f9e0c', 'id="reservation-6125bd0ba9256232e45f9e0c'];
        return request(app)
            .get('/2021-08-02/reservation')
            .then(function(response){
                expect(response.text).to.contain('id="reservation-' + list[0]).and.contain('id="reservation-' + list[1]);
            })
    });
});

describe('Unit testing the /:year-:month-:day/reservation/create route', function() {
    it('should retrieve all the room types', function() {
        types = ['Bridal Family Room', 'Combined Studio Type', 'One Bedroom', 'Studio Type', 'Studio Type with Balcony',
                    'Triplex with Balcony', 'Twin Bed', 'Twin Bed with Balcony', 'Two Bedroom'];
        return request(app)
            .get('/2021-08-02/reservation/create')
            .then(function(response){
                expect(response.text).to.contain(types[0]).and.contain(types[1]).and.contain(types[2]).and.contain(types[3]).and
                .contain(types[4]).and.contain(types[5]).and.contain(types[6]).and.contain(types[7]).and.contain(types[8]);
            })
    });

    it('should extract the correct date from the route and set it as start date', function() {
        testDate = '2021-08-02';
        return request(app)
            .get('/2021-08-02/reservation/create')
            .then(function(response){
                expect(response.text).to.contain(testDate);
            })
    });
});