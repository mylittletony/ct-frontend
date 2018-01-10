'use strict';

var url = process.env.CT_URL || 'dashboard.ctapp.io'
var base_url, api_url, auth_url;

var exports;

if (process.env.NODE_ENV === 'production') {

  api_url = process.env.API_URL || 'https://api.ctapp.io/api/v1'
  auth_url = process.env.AUTH_URL || 'https://id.ctapp.io'
  base_url = process.env.CT_URL || 'dashboard.ctapp.io'

  exports = {
    callbackURL: 'https://' + base_url + '/auth/login/callback',
    authorizationURL: auth_url + "/oauth/authorize",
    profileURL: api_url + "/me.json",
    tokenURL: auth_url + "/oauth/token",
    baseURL: "https://" + base_url
  }

} else if (process.env.NODE_ENV === 'beta') {

  api_url = process.env.API_URL || 'https://beta.ctapp.io/api/v1'
  auth_url = process.env.AUTH_URL || 'https://id.ctapp.io'
  base_url = process.env.CT_URL || 'dashboard.ctapp.io'

  exports = {
    callbackURL: 'https://' + base_url + '/auth/login/callback',
    authorizationURL: auth_url + "/oauth/authorize",
    profileURL: api_url + "/me.json",
    tokenURL: auth_url + "/oauth/token",
    baseURL: "https://" + base_url
  }

} else {

  api_url = process.env.API_URL || 'http://mywifi.test:8080/api/v1'
  auth_url = process.env.AUTH_URL || 'http://mywifi.test:8080'
  base_url = process.env.CT_URL || 'dashboard.ctapp.test:9090'

  exports = {
    callbackURL: "http://" + base_url + "/auth/login/callback",
    authorizationURL: auth_url + "/oauth/authorize",
    profileURL: api_url + "/me.json",
    tokenURL: auth_url + "/oauth/token",
    APP_ID: "e2fd310846f27f0e6390fb65a528443a480a45d993a2a8412f25158376629b5f",
    APP_SECRET: "68556927b3bfd8675fe2489b96864fda167e5c2aa96147f06a6123da405b71fe",
    baseURL: "http://" + base_url,
    DEBUG: ''
  }

  var _ = require('../../node_modules/lodash');

  var localConfig;
  try {
      localConfig = require('./local-config.js');
  } catch(e) {
      localConfig = {};
  }

  exports = _.merge(exports, localConfig);
}

module.exports = exports;
