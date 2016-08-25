// Example for a custom configuration.  Rename the file to 'custom-config.js'.
// Whatever you configure here overrides the default variables set in
// 'local-config.js' (using lodash's merge function).
'use strict';

var api_url = 'https://api.ctapp.io';
var auth_url = 'https://id.ctapp.io';
var base_url = 'https://your-base-url';

module.exports = {
    frontend: {
        constants: {
            API_END_POINT: api_url + '/api/v1',
            API_URL: api_url,
            AUTH_URL: auth_url,
        }
    },
    server: {
        env: {
            APP_ID: "",
            APP_SECRET: "",
            profileURL: api_url + "/api/v1/me.json",
            authorizationURL: auth_url + '/oauth/authorize',
            tokenURL: auth_url + "/oauth/token",
            callbackURL: base_url + '/auth/login/callback',
            baseURL: base_url,
            // Set to true to enable debugging.
            DEBUG: 'true'
        }
    }
};
