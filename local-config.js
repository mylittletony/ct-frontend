// Example for a local configuration.  Rename the file to 'local-config.js'.
// Whatever you configure here overrides the default variables set in
// 'default-config.js' (using lodash's merge function).
'use strict';

var api_url = 'http://mywifi.dev:8080';
var auth_url = 'http://mywifi.dev:8080';
var base_url = 'my.ctapp.dev:9090';

module.exports = {
    frontend: {
        constants: {
            API_END_POINT: api_url + '/api/v1',
            API_URL: api_url,
            AUTH_URL: auth_url,
        }
    },
    server: {
        APP_ID: '955c8408048c3492d8cb65c18ba698d7abdd61cc96598b0759d4f5fd5eab24cb',
        APP_SECRET: '984a0f04950a39da941539397a32183a44d43d7a84da0e099fbbe819020baeda',
        callbackURL: base_url + '/auth/login/callback',
        authorizationURL: auth_url + '/oauth/authorize',
        profileURL: api_url + "/me.json",
        tokenURL: auth_url + "/oauth/token",
        baseURL: base_url,
        DEBUG: ''
    }
};
