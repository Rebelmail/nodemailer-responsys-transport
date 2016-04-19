'use strict';

const responsys = require('../');

const nock = require('nock');
const assert = require('assert');

describe('ResponsysTransport', () => {
  describe('#login', () => {
    it('should return with stored token', (done) => {
      const transporter = responsys({ token: 1 auth: {} });
      transporter.login((err, token) => {
        assert.ifError(err);
        assert.ok(token);
        done();
      });
    });
    it('should return if there is an error', (done) => {
      const transporter = responsys({ auth: { username: 'test', password: '123' } });
      transporter.login((err) => {
        assert.ok(err);
        done();
      });
    });
    it('should return token if successful', (done) => {
      const transporter = responsys({ auth: { username: 'test', password: '123' } });
      const server = nock(transporter.rootURL).post('/rest/api/v1.1/auth/token').reply(200, {
        authToken: 123
      });
      transporter.login((err, token) => {
        assert.ifError(err);
        assert.equal(token, 123);
        done();
      });
    });
  });
  describe('#send', () => {
    it('should return error from #login if failed', (done) => {
      const transporter = responsys({ auth: { username: 'test', password: '123' } });
      transporter.login((err, token) => {
        assert.ok(err);
        done();
      });
    });
    it('should return the results of the call', (done) => {
      const transporter = responsys({ token: 1, campaignName: 'test', auth: {} });
      const server = nock(transporter.rootURL).post('/rest/api/v1/campaigns/test/email').reply(200);
      transporter.send({ data: { to: 'test@test.com' }} , (err) => {
        assert.ifError(err);
        done();
      });
    });
  });
});
