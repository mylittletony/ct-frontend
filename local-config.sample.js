// Example for a local configuration.  Rename the file to 'local-config.js'.
// Whatever you configure here overrides the default variables set in
// 'default-config.js' (using lodash's merge function).
'use strict';

var api_url = 'http://api.ctapp.io';
var auth_url = 'http://id.ctapp.io';
var base_url = 'https://your.app.server';

module.exports = {
    frontend: {
        constants: {
            API_END_POINT: api_url + '/api/v1',
            API_URL: api_url,
            AUTH_URL: auth_url,
        }
    },
    server: {
        // Required!
        //APP_ID: 'your app id',
        // Required!
        //APP_SECRET: 'your app secret',
        callbackURL: base_url + '/auth/login/callback',
        authorizationURL: auth_url + '/oauth/authorize',
        profileURL: api_url + "/me.json",
        tokenURL: auth_url + "/oauth/token",
        baseURL: base_url,
        // Set to true to enable debugging.
        DEBUG: ''
    }
};

