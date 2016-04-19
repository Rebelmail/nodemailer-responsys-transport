'use strict';

const request = require('request');
const addrs = require('email-addresses');

class ResponsysTransport {
  constructor(options) {
    options = options || { auth: { } };
    this.token = options.token;
    this.username = options.auth.username;
    this.password = options.auth.password;

    this.rootURL = options.rootURL || 'https://api2-016.responsys.net';
    this.endpoint = this.rootURL + `/rest/api/v1/campaigns/${options.campaignName}/email`;
    this.loginEndpoint = this.rootURL + '/rest/api/v1.1/auth/token';
  }

  login(cb) {

    if (this.token) {
      return cb(null, this.token);
    }

    request({
      method: 'POST',
      url: this.loginEndpoint,
      form: {
        user_name: this.username,
        password: this.password,
        auth_type: 'password'
      }
    }, (err, res, body) => {
      body = body ? JSON.parse(body) : body;
      if (err || res.statusCode !== 200) {
        return cb(err || body);
      }

      this.token = body.authToken;
      return cb(err, this.token);
    });
  }

  send(mail, cb) {
    const data = mail.data || {};
    this.login((err) => {
      if (err) {
        return cb(err);
      }

      const toAddr = addrs.parseOneAddress(data.to);

      request({
        method: 'POST',
        url: this.endpoint,
        headers: {
          Authorization: this.token
        },
        json: {
          recordData: {
            records: [{
              fieldValues: [
                toAddr.address
              ]
            }],
            fieldNames: [
              'EMAIL_ADDRESS_'
            ]
          },
          mergeRule: {
            htmlValue: 'H',
            matchColumnName1: 'EMAIL_ADDRESS_',
            matchColumnName2: null,
            matchColumnName3: null,
            optoutValue: 'O',
            insertOnNoMatch: true,
            defaultPermissionStatus: 'OPTIN',
            rejectRecordIfChannelEmpty: 'E',
            optinValue: 'I',
            updateOnMatch: 'REPLACE_ALL',
            textValue: 'T',
            matchOperator: 'NONE'
          },
          triggerData: [{
            optionalData : [{
              name: 'html',
              value: data.html
            }]
          }]
        }
      }, cb);
    });
  }
}

module.exports = function(options) {
  return new ResponsysTransport(options);
};
