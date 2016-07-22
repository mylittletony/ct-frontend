// Example for a local configuration.  Rename the file to 'local-config.js'.
// Whatever you configure here overrides the default variables set in
// 'default-config.js' (using lodash's merge function).
'use strict';

module.exports = {
    frontend: {
        constants: {
            API_END_POINT: 'https://api.ctapp.io/api/v1',
            API_URL: 'https://api.ctapp.io',
            AUTH_URL: 'https://id.ctapp.io',
        }
    },
    server: {
    }
};
