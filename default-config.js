'use strict';

module.exports = {
    frontend: {
        // All these constants are exposed as is in the angular application.  
        // Therefore you should never put any sensitive information like 
        // passwords or secrets in here.
        //
        // Important! These variables are only used in the development
        // environment.  They are ignored for test, beta, and production!
        constants: {
            CONFIG: {
            },
            // FIXME! These constants are outside of 'CONFIG' for historical
            // reasons.  They should be moved inside 'CONFIG' at some time.
            API_END_POINT: 'http://mywifi.dev:8080/api/v1',
            API_URL: 'http://mywifi.dev:8080',
            STRIPE_KEY: 'pk_test_E3rGjKckx4EUL65pXgv6zUed',
            AUTH_URL: 'http://id.mywifi.dev:8080',
            SLACK_TOKEN: '3540010629.12007999527',
            CHIMP_TOKEN: '531543883634',
            INTERCOM: 'xxx',
            PUSHER: 'xxx',
            DEBUG: true,
            COLOURS: '#009688 #FF5722 #03A9F4 #607D8B #F44336 #00BCD4'
        }
    },
    // Server configuration.
    server: {
    }
};
