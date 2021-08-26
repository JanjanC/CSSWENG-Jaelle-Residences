const assert = require('assert');
const expect = require('chai').expect
const request = require('supertest');
const express = require('express');
const app = require('../server.js');

describe('Unit testing the GET /error route', function() {
    it('should return OK status', function() {
        return request(app)
            .get('/error')
            .then(function(response){
                assert.equal(response.status, 200);
            })
    });

    it('should return message on rendering', function() {
        return request(app)
          .get('/error')
          .then(function(response){
              expect(response.text).to.contain('Error');
          })
      });
});

describe('Unit testing the GET * route', function() {
    it('should return OK status', function() {
        return request(app)
            .get('/wqekjthfsdkjlhaf')
            .then(function(response){
                assert.equal(response.status, 200);
            })
    });

    it('should return message on rendering', function() {
        return request(app)
          .get('/wqekjthfsdkjlhaf')
          .then(function(response){
              expect(response.text).to.contain('Error');
          })
      });
});

describe('Unit testing the POST * route', function() {
    it('should return OK status', function() {
        return request(app)
            .post('/wqekjthfsdkjlhaf')
            .then(function(response){
                assert.equal(response.status, 200);
            })
    });

    it('should return message on rendering', function() {
        return request(app)
          .post('/wqekjthfsdkjlhaf')
          .then(function(response){
              expect(response.text).to.contain('Error');
          })
      });
});