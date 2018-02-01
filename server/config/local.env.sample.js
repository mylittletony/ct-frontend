'use strict';

var url = process.env.CT_URL || 'dashboard.ctapp.io'
var base_url, api_url, auth_url;

var exports;

if (process.env.NODE_ENV === 'production') {

  api_url   = 'https://api.ctapp.io/api/v1'
  auth_url  = 'https://id.oh-mimo.com'
  base_url  = 'app.oh-mimo.com'

  exports = {
    callbackURL: 'https://' + base_url + '/auth/login/callback',
    authorizationURL: auth_url + "/oauth/authorize",
    profileURL: api_url + "/me.json",
    tokenURL: auth_url + "/oauth/token",
    baseURL: "https://" + base_url
  }

} else if (process.env.NODE_ENV === 'beta') {

  api_url   = 'https://beta.ctapp.io/api/v1'
  auth_url  = 'https://id.oh-mimo.com'
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
    APP_ID: "21616404fa3f89975d034bb802fbdcba8d5d98ad03c94768cdd0aa34bbe141ef",
    APP_SECRET: "1fa9a683f0401614c908ab30f57e539717668a981eef68724590279ffc26c6a9",
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
