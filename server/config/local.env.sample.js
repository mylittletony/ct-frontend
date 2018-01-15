'use strict';

var url = process.env.CT_URL || 'dashboard.ctapp.io'
var base_url, api_url, auth_url;

var exports;

if (process.env.NODE_ENV === 'production') {

  api_url   = 'https://api.ctapp.io/api/v1'
  auth_url  = 'https://id.mimo.today'
  base_url  = 'app.mimo.today'

  exports = {
    callbackURL: 'https://' + base_url + '/auth/login/callback',
    authorizationURL: auth_url + "/oauth/authorize",
    profileURL: api_url + "/me.json",
    tokenURL: auth_url + "/oauth/token",
    baseURL: "https://" + base_url
  }

} else if (process.env.NODE_ENV === 'beta') {

  api_url   = 'https://beta.ctapp.io/api/v1'
  auth_url  = 'https://id.mimo.today'
  base_url  = 'dashboard.ctapp.io'

  exports = {
    callbackURL: 'https://' + base_url + '/auth/login/callback',
    authorizationURL: auth_url + "/oauth/authorize",
    profileURL: api_url + "/me.json",
    tokenURL: auth_url + "/oauth/token",
    baseURL: "https://" + base_url
  }

} else {

  api_url   = 'http://mimo.test:8080/api/v1'
  auth_url  = 'http://mimo.test:8080'
  base_url  = 'app.mimo.test:9090'

  exports = {
    callbackURL: "http://" + base_url + "/auth/login/callback",
    authorizationURL: auth_url + "/oauth/authorize",
    profileURL: api_url + "/me.json",
    tokenURL: auth_url + "/oauth/token",
    APP_ID: "3aebdc2304e986b2a34d6b3dd2b8b426ae95d5d5a67b2a645af7f69709bdfff5",
    APP_SECRET: "d8f902f6ed8b0c934f9916a977b603e75e12a7545c0ba7d05dfe024305ed93a5",
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
