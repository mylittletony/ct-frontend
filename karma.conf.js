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
      'client/bower_components/angular-payments/stripe.js',
      'client/bower_components/angular/angular.js',
      'client/bower_components/angular-mocks/angular-mocks.js',
      'client/bower_components/angular-resource/angular-resource.js',
      'client/bower_components/angular-cookies/angular-cookies.js',
      'client/bower_components/angular-messages/angular-messages.js',
      'client/bower_components/angular-material/angular-material.js',
      'client/bower_components/angular-aria/angular-aria.js',
      'client/bower_components/angular-material-data-table/dist/md-data-table.js',
      'client/bower_components/angular-minicolors/angular-minicolors.js',
      'client/bower_components/angular-sanitize/angular-sanitize.js',
      'client/bower_components/angular-animate/angular-animate.js',
      'client/bower_components/angular-route/angular-route.js',
      'client/bower_components/angular-gettext/dist/angular-gettext.js',
      'client/bower_components/angular-payments/lib/angular-payments.js',
      'client/bower_components/pusher-angular/pusher.min.js',
      'client/bower_components/pusher-angular/lib/pusher-angular.js',
      'client/bower_components/ngstorage/ngStorage.js',
      'client/bower_components/angular-scroll-glue/src/scrollglue.js',
      'client/bower_components/foundation/css/foundation.css',
      'client/bower_components/angular-foundation/template/**/*.html',
      'client/bower_components/ngStorage/ngStorage.js',
      'client/bower_components/jquery-minicolors/jquery.minicolors.js',
      'client/bower_components/angular-touch/angular-touch.js',
      'client/bower_components/filepicker-ct/filepicker.min.js',
      'client/bower_components/select2/select2.js',
      'client/bower_components/nouislider/jquery.nouislider.min.js',
      'client/bower_components/moment/moment.js',
      'client/bower_components/urijs/src/URI.js',
      'client/bower_components/moment-timezone/moment-timezone.js',
      'client/bower_components/angular-moment/angular-moment.min.js',
      'client/bower_components/emojionearea/dist/emojionearea.min.js',
      'client/scripts/config.js',
      'client/app/app.js',
      'client/app/**/*.js',
      'client/components/**/*.js',
      'client/app/**/*.html',
      'client/components/**/*.html',
      'test/spec/**/*.js',
      'test/ec2/**/*.js',
    ],

    preprocessors: {
      'client/components/**/*.html': ['ng-html2js'],
    },

    ngHtml2JsPreprocessor: {
      stripPrefix: 'client/',
      moduleName: "templates"
    },

    cacheIdFromPath: function(filepath) {
      return filepath.match(/client\/components\/*\*\/.*/)[0];
    },

    exclude: [],

    port: 9090,

    logLevel: config.LOG_INFO,

    autoWatch: false,

    // Start these browsers, currently available:
    // - Chrome
    // - ChromeCanary
    // - Firefox
    // - Opera
    // - Safari (only Mac)
    // - PhantomJS
    // - IE (only Windows)
    browsers: ['PhantomJS2'],
    // Continuous Integration mode
    // if true, it capture browsers, run tests and exit
    singleRun: true
  });
};
