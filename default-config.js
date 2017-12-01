'use strict';

// Important! This configuration file is currently only used in the
// development.  It is ignored for test, beta, and production!
var exec = require('sync-exec');
var commitHash = exec('git log --pretty=format:"%h" -n 1');
var commitDate = exec('git log --pretty=format:"%ci" -n 1');
module.exports = {
    frontend: {
        // All these constants are exposed as is in the angular application.
        // Therefore you should never put any sensitive information like
        // passwords or secrets in here.
        //
        constants: {
            CONFIG: {
                // Everything here is injected as $rootScope.CONFIG into
                // the application.
            },
            // FIXME! These constants are outside of 'CONFIG' for historical
            // reasons.  They should be moved inside 'CONFIG' at some time.
            API_END_POINT: 'https://api.ctapp.io/api/v1',
            API_END_POINT_V2: 'https://api.ctapp.io/api/v2',
            API_URL: 'https://api.ctapp.io',
            STRIPE_KEY: 'pk_test_E3rGjKckx4EUL65pXgv6zUed',
            AUTH_URL: 'https://api.ctapp.io',
            SLACK_TOKEN: '3540010629.12007999527',
            CHIMP_TOKEN: '531543883634',
            INTERCOM: 'z0kiwroa',
            PUSHER: 'f5c774e098156e548079',
            DEBUG: true,
            COLOURS: '#16ac5b #118AB2 #FFD166 #EF476F #70C1B3 #073B4C',
            COMMITHASH: commitHash.stdout,
            THEMES: [
                "pink",
                "orange",
                "deep-orange",
                "blue",
                "blue-grey",
                "light-blue",
                "red",
                "green",
                "light-green",
                "lime",
                "yellow",
                "teal",
                "brown",
                "purple",
                "deep-purple",
                "cyan",
                "yellow",
                "amber",
                "indigo",
                "brown",
                "grey"
            ]
        }
    },
    // Server configuration.
    server: {
        env: {
            // Required!
            //APP_ID: 'put your app id here!',
            // Required!
            //APP_SECRET: 'put your app secret here!',
            // Required!
            //BASE_URL: 'https://url.of.your.server',
            // Required!
            // callbackURL: 'https://url.of.your.server/auth/login/callback',
            // Debugging?
            DEBUG: false,
        }
    }
};
