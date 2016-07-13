'use strict';

var url = process.env.CT_URL || 'my.ctapp.io'
var base_url, api_url, auth_url;

if (process.env.NODE_ENV === 'production') {

  api_url = process.env.API_URL || 'https://api.ctapp.io/api/v1'
  auth_url = process.env.AUTH_URL || 'https://id.ctapp.io'
  base_url = process.env.CT_URL || 'my.ctapp.io'

  module.exports = {
    callbackURL: 'https://' + base_url + '/auth/login/callback',
    authorizationURL: auth_url + "/oauth/authorize",
    profileURL: api_url + "/me.json",
    tokenURL: auth_url + "/oauth/token",
    baseURL: "https://" + base_url
  }

} else if (process.env.NODE_ENV === 'beta') {

  api_url = process.env.API_URL || 'https://beta.ctapp.io/api/v1'
  auth_url = process.env.AUTH_URL || 'https://id.ctapp.io'
  base_url = process.env.CT_URL || 'my.ctapp.io'

  module.exports = {
    callbackURL: 'https://' + base_url + '/auth/login/callback',
    authorizationURL: auth_url + "/oauth/authorize",
    profileURL: api_url + "/me.json",
    tokenURL: auth_url + "/oauth/token",
    baseURL: "https://" + base_url
  }

} else {

  api_url = process.env.API_URL || 'http://mywifi.dev:8080/api/v1'
  auth_url = process.env.AUTH_URL || 'http://mywifi.dev:8080'
  base_url = process.env.CT_URL || 'my.ctapp.dev:9000'

  module.exports = {
    callbackURL: "http://" + base_url + "/auth/login/callback",
    authorizationURL: auth_url + "/oauth/authorize",
    profileURL: api_url + "/me.json",
    tokenURL: auth_url + "/oauth/token",
    APP_ID: "955c8408048c3492d8cb65c18ba698d7abdd61cc96598b0759d4f5fd5eab24cb",
    APP_SECRET: "984a0f04950a39da941539397a32183a44d43d7a84da0e099fbbe819020baeda",
    baseURL: "http://" + base_url,
    DEBUG: ''
  }

}
