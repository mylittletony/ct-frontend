'use strict';

var url = process.env.CT_URL || 'dashboard.ctapp.io'
var base_url, api_url, auth_url;

var exports;

if (process.env.NODE_ENV === 'production') {

  api_url = process.env.API_URL || 'https://api.ctapp.io/api/v1'
  auth_url = 'https://id.ctapp.io'
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
  auth_url = 'https://id.ctapp.io'
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
  auth_url = process.env.AUTH_URL || 'http://id.mimo.test:8080'
  base_url = process.env.CT_URL || 'app.mimo.test:9090'

  exports = {
    callbackURL: "http://" + base_url + "/auth/login/callback",
    authorizationURL: auth_url + "/oauth/authorize",
    profileURL: api_url + "/me.json",
    tokenURL: auth_url + "/oauth/token",
    APP_ID: "3a0eeda23761adbca5c6aa280fdf9fd4356ac9aa44824181b26ebe1690bcbe7e",
    APP_SECRET: "ae6a6aa46f4dcac171e11344792b3db209bd7949455b01bf106d75e15e51c345",
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
