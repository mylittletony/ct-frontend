/**
 * Main application routes
 */

'use strict';

var errors = require('./components/errors');
var secrets = require('./config/local.env.sample');
var request = require('request');
var path = require('path');

module.exports = function(app) {

  app.get('/integrations/:id',
          function(req, res) {
            var code = req.query.code || req.query.AccountSid;
            res.redirect(secrets.baseURL + 'me/integrations/' + req.params.id + '?code=' + code)
          });

  app.get('/auth/refreshToken',
    function(req, res) {
      console.log('Refreshing token...');
      var url = secrets.tokenURL;
      var json = {
        clientID:       process.env.APP_ID,
        clientSecret:   process.env.APP_SECRET,
        refresh_token:  req.query.token,
        grant_type:     'refresh_token'
      }
      request.post(
        url,
        { form: json },
        function (error, response, body) {
          if (!error && response.statusCode === 200) {
            res.send(response.body)
          } else {
            res.json(403, response)
          }
        }
      );
    });

  // All undefined asset or api routes should return a 404
  app.route('/:url(api|auth|components|app|bower_components|assets)/*')
   .get(errors[404]);

   app.get('/translations/:lang', function(req, res) {
     res.sendStatus(200);
     // res.sendFile(path.join(__dirname, '/translations/' + req.params.lang));
  });

  app.route('/*')
    .get(function(req, res) {
      res.sendFile(app.get('appPath') + '/index.html');
    });
};
