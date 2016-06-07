/**
 * Main application file
 */

'use strict';

// Set default node environment to development
process.env.NODE_ENV = process.env.NODE_ENV || 'development';

var express = require('express');
var helmet = require('helmet');

var config = require('./config/environment');
// Setup server
var app = express();

app.use(helmet());
app.use(helmet.xframe('deny'));
app.use(helmet.frameguard('deny'));
app.use(helmet.xssFilter());
app.use(helmet.hidePoweredBy());

var server = require('http').createServer(app);
require('./config/express')(app);
require('./routes')(app);

// Start server
server.listen(config.port, config.ip, function () {
  console.log('Express server listening on %d, in %s mode', config.port, app.get('env'));
});

exports = module.exports = app;
