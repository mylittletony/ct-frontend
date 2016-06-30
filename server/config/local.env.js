'use strict';

var url = process.env.CT_URL || 'my.ctapp.io'

if (process.env.NODE_ENV === 'production') {
  module.exports = {
    callbackURL: 'https://' + url + '/auth/login/callback',
    authorizationURL: "https://id.ctapp.io/oauth/authorize",
    profileURL: "https://api.ctapp.io/api/v1/me.json",
    tokenURL: "https://api.ctapp.io/oauth/token",
    baseURL: "https://my.ctapp.io"
  }
} else if (process.env.NODE_ENV === 'beta') {
  module.exports = {
    callbackURL: 'http://' + url + '/auth/login/callback',
    authorizationURL: "http://mywifi.dev:8080/oauth/authorize",
    profileURL: "http://mywifi.dev:8080/api/v1/me.json",
    tokenURL: "http://127.0.0.1:8080/oauth/token",
    baseURL: "http://my.ctapp.dev:9090/#/",
  }
} else {
  module.exports = {
    callbackURL: "http://my.ctapp.dev:9000/auth/login/callback",
    authorizationURL: "http://mywifi.dev:8080/oauth/authorize",
    profileURL: "http://mywifi.dev:8080/api/v1/me.json",
    tokenURL: "http://127.0.0.1:8080/oauth/token",
    APP_ID: "955c8408048c3492d8cb65c18ba698d7abdd61cc96598b0759d4f5fd5eab24cb",
    APP_SECRET: "984a0f04950a39da941539397a32183a44d43d7a84da0e099fbbe819020baeda",
    baseURL: "http://my.ctapp.dev:9090/#/",
    DEBUG: ''
  }
}

// Replace the credentials in the last block with your own ones from CT
