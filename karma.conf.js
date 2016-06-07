// Karma configuration
// http://karma-runner.github.io/0.10/config/configuration-file.html

module.exports = function(config) {
  config.set({
    // base path, that will be used to resolve files and exclude
    basePath: './',

    // testing framework to use (jasmine/mocha/qunit/...)
    frameworks: ['jasmine'],

    // list of files / patterns to load in the browser
    files: [
      'client/bower_components/jquery/dist/jquery.js',
      'client/bower_components/highcharts/highcharts.js',
      'client/bower_components/mapbox.js/mapbox.js',
      'client/bower_components/angular-payments/stripe.js',
      'client/bower_components/angular/angular.js',
      'client/bower_components/angular-mocks/angular-mocks.js',
      'client/bower_components/angular-resource/angular-resource.js',
      'client/bower_components/angular-cookies/angular-cookies.js',
      'client/bower_components/angular-sanitize/angular-sanitize.js',
      'client/bower_components/angular-animate/angular-animate.js',
      'client/bower_components/angular-route/angular-route.js',
      'client/bower_components/angular-payments/lib/angular-payments.js',
      'client/bower_components/pusher-angular/pusher.min.js',
      'client/bower_components/pusher-angular/lib/pusher-angular.js',
      'client/bower_components/ngstorage/ngStorage.js',
      'client/bower_components/foundation/css/foundation.css',
      'client/bower_components/angular-foundation/template/**/*.html',
      'client/scripts/mm-foundation-custom-0.6.0-SNAPSHOT.min.js',
      'client/bower_components/ngStorage/ngStorage.js',
      'client/bower_components/jquery-minicolors/jquery.minicolors.js',
      'client/bower_components/angular-touch/angular-touch.js',
      'client/bower_components/filepicker-ct/filepicker.min.js',
      'client/bower_components/select2/select2.js',
      'client/bower_components/nouislider/jquery.nouislider.min.js',
      'client/bower_components/angular-nouislider/src/nouislider.min.js',
      'client/bower_components/moment/moment.js',
      'client/bower_components/urijs/src/URI.js',
      'client/bower_components/moment-timezone/moment-timezone.js',
      'client/bower_components/angular-moment/angular-moment.min.js',
      'client/bower_components/angular-gridster/dist/angular-gridster.min.js',
      'client/bower_components/ngDraggable/ngDraggable.js',
      'client/bower_components/angular-ui-select/dist/select.js',
      'client/scripts/config.js',
      'client/app/app.js',
      'client/app/**/*.js',
      'client/components/**/*.js',
      'client/app/**/*.html',
      'client/components/**/*.html',
      'test/spec/**/*.js',
      'test/ec2/**/*.js'
    ],

    preprocessors: {
      '**/*.jade': 'ng-jade2js',
      '**/*.html': 'html2js',
    },

    ngHtml2JsPreprocessor: {
      stripPrefix: 'client/'
    },

    ngJade2JsPreprocessor: {
      stripPrefix: 'client/'
    },

    // list of files / patterns to exclude
    exclude: [],

    // web server port
    port: 9090,

    // level of logging
    // possible values: LOG_DISABLE || LOG_ERROR || LOG_WARN || LOG_INFO || LOG_DEBUG
    logLevel: config.LOG_INFO,


    // enable / disable watching file and executing tests whenever any file changes
    autoWatch: false,

    // Start these browsers, currently available:
    // - Chrome
    // - ChromeCanary
    // - Firefox
    // - Opera
    // - Safari (only Mac)
    // - PhantomJS
    // - IE (only Windows)
    browsers: ['PhantomJS'],
    // Continuous Integration mode
    // if true, it capture browsers, run tests and exit
    singleRun: true
  });
};
