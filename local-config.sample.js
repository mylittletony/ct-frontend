// devolo-specific configuration goes here.  You also need a 
// 'custom-config.js' for your local installation.

'use strict';

var _ = require('lodash');
var customConfig = require('./custom-config.js');

module.exports = _.merge({
    frontend: {
        constants: {
        }
    },
    sass: {
        server: {
            files: {
                '.tmp/app/custom.css': '<%= yeoman.client %>/app/custom.scss'
            },
        }
    }
}, customConfig);
