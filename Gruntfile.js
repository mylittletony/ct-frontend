// Generated on 2014-09-08 using generator-angular-fullstack 2.0.13
'use strict';

module.exports = function (grunt) {
  var _ = require('lodash');
  var fs = require('fs');

  var defaultConfig = require('./default-config.js');

  var localConfig;
  var stat;
  try {
      stat = fs.statSync('./local-config.js');
  } catch(e) {
      localConfig = {};
  }
  if (stat) {
      try {
          localConfig = require('./local-config.js');
      } catch(e) {
          throw("error reading './local-config.js': " + e); 
      }
  }

  var config = _.merge(defaultConfig, localConfig);

  grunt.loadNpmTasks('grunt-karma');
  grunt.loadNpmTasks('grunt-ng-constant');

  // Load grunt tasks automatically, when needed

  require('jit-grunt')(grunt, {
    express: 'grunt-express-server',
    useminPrepare: 'grunt-usemin',
    ngtemplates: 'grunt-angular-templates',
    cdnify: 'grunt-google-cdn',
    protractor: 'grunt-protractor-runner',
    injector: 'grunt-asset-injector',
    buildcontrol: 'grunt-build-control'
  });

  // Time how long tasks take. Can help when optimizing build times
  require('time-grunt')(grunt);

  // Required for the translations //
  var potfiles = [
      'client/index.html',
      'client/components/**/*.html',
      'client/components/**/*.js',
      'client/app/main/*.js',
  ];

  var languages = [
      'en_GB',
      'de_DE',
      'fr_FR',
      'ro',
      'it'
  ];
  // Define the configuration for all the tasks
  grunt.initConfig({

    ngconstant: {
      options: {
        space: '  ',
        wrap: '"use strict";\n\n {%= __ngModule %}',
        name: 'config',
        dest: '<%= yeoman.client %>/scripts/config.js',
      },
      test: {
        constants: {
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
      development: {
        constants: config.frontend.constants
      },
      beta: {
        constants: {
          API_END_POINT: 'https://beta.ctapp.io/api/v1',
          API_URL: 'https://beta.ctapp.io',
          STRIPE_KEY: 'pk_live_Fe0qoaafcT68z8OjFYJwg1vC',
          AUTH_URL: 'https://id.ctapp.io',
          SLACK_TOKEN: '3540010629.11828901815',
          CHIMP_TOKEN: '279197455989',
          PUSHER: 'f5c774e098156e548079',
          INTERCOM: 'zklfhs87',
          DEBUG: true,
          COLOURS: '#009688 #FF5722 #03A9F4 #607D8B #F44336 #00BCD4'
        }
      },
      production: {
        constants: {
          API_END_POINT: 'https://api.ctapp.io/api/v1',
          API_URL: 'https://api.ctapp.io',
          STRIPE_KEY: 'pk_live_Fe0qoaafcT68z8OjFYJwg1vC',
          AUTH_URL: 'https://id.ctapp.io',
          SLACK_TOKEN: '3540010629.11828901815',
          CHIMP_TOKEN: '279197455989',
          PUSHER: 'f5c774e098156e548079',
          INTERCOM: 'zklfhs87',
          DEBUG: true,
          COLOURS: '#009688 #FF5722 #03A9F4 #607D8B #F44336 #00BCD4'
        }
      }
    },
    // Project settings
    pkg: grunt.file.readJSON('package.json'),
    yeoman: {
      // configurable paths
      client: require('./bower.json').appPath || 'client',
      dist: 'dist'
    },
    express: {
      options: {
        port: process.env.PORT || 9090
      },
      dev: {
        options: {
          script: 'server/app.js',
          debug: true
        }
      },
      prod: {
        options: {
          script: 'dist/server/app.js'
        }
      }
    },
    open: {
      server: {
        url: 'http://localhost:<%= express.options.port %>'
      }
    },
    watch: {
      injectJS: {
        files: [
          '<%= yeoman.client %>/{app,components}/**/*.js',
          '!<%= yeoman.client %>/{app,components}/**/*.spec.js',
          '!<%= yeoman.client %>/{app,components}/**/*.mock.js',
          '!<%= yeoman.client %>/app/app.js'],
        tasks: ['injector:scripts']
      },
      injectCss: {
        files: [
          '<%= yeoman.client %>/{app,components}/**/*.css'],
        tasks: ['injector:css']
      },
      injectSass: {
        files: [
          '<%= yeoman.client %>/{app,components}/**/*.{scss,sass}'],
        tasks: ['injector:sass']
      },
      sass: {
        files: [
          '<%= yeoman.client %>/{app,components}/**/*.{scss,sass}'],
        tasks: ['sass', 'autoprefixer']
      },
      mochaTest: {
        files: ['server/**/*.spec.js'],
        tasks: ['env:test', 'mochaTest']
      },
      jsTest: {
        files: [
          '<%= yeoman.client %>/{app,components}/**/*.spec.js',
          '<%= yeoman.client %>/{app,components}/**/*.mock.js'
        ],
        tasks: ['newer:jshint:all', 'karma']
      },
      gruntfile: {
        files: ['Gruntfile.js']
      },
      livereload: {
        files: [
          '{.tmp,<%= yeoman.client %>}/{app,components}/**/*.css',
          '{.tmp,<%= yeoman.client %>}/{app,components}/**/*.html',
          '{.tmp,<%= yeoman.client %>}/{app,components}/**/*.js',
          '!{.tmp,<%= yeoman.client %>}{app,components}/**/*.spec.js',
          '!{.tmp,<%= yeoman.client %>}/{app,components}/**/*.mock.js',
          '<%= yeoman.client %>/assets/images/{,*//*}*.{png,jpg,jpeg,gif,webp,svg}',
          '<%= yeoman.client %>/assets/js/{,*//*}*.{js}',
          '<%= yeoman.client %>/assets/css/{,*//*}*.{js}'
        ],
        options: {
          livereload: true
        }
      },
      express: {
        files: [
          'server/**/*.{js,json}'
        ],
        tasks: ['express:dev', 'wait'],
        options: {
          livereload: true,
          nospawn: true //Without this option specified express won't be reloaded
        }
      }
    },

    // Required for the translations //
    nggettext_extract: {
      pot: {
        files: {
          'po/cucumber-frontend.pot': potfiles
        }
      }
    },
    msgInitMerge: {
      target_pot: {
        src: ['po/cucumber-frontend.pot'],
        options: {
            locales: languages,
            poFilesPath: 'po/<%= locale%>.po',
        }
      }
    },
    nggettext_compile: {
      options: {
          format: 'json'
      },
      all: {
          files: [
              {
                  expand: true,
                  dot: true,
                  cwd: "po",
                  dest: '<%= yeoman.dist %>/server/translations',
                  src: ["*.po"],
                  ext: ".json"
              }
          ]
      }
    },

    potomo: {
      all: {
        files: [
            {
              expand: true,
              cwd: 'po',
              src: ['*.po'],
              dest: 'po',
              ext: '.mo',
              nonull: true
            }
        ]
      }
    },

    // Make sure code styles are up to par and there are no obvious mistakes
    jshint: {
      options: {
        jshintrc: '<%= yeoman.client %>/.jshintrc',
        reporter: require('jshint-stylish')
      },
      server: {
        options: {
          jshintrc: 'server/.jshintrc'
        },
        src: [
          'server/**/*.js',
          '!server/**/*.spec.js',
          '!<%= yeoman.client %>/components/js/*'
        ]
      },
      serverTest: {
        options: {
          jshintrc: 'server/.jshintrc-spec'
        },
        src: ['server/**/*.spec.js']
      },
      all: [
        '<%= yeoman.client %>/{app,components}/**/*.js',
        '!<%= yeoman.client %>/{app,components}/**/*.spec.js',
        '!<%= yeoman.client %>/{app,components}/**/*.mock.js'
      ],
      test: {
        src: [
          '<%= yeoman.client %>/{app,components}/**/*.spec.js',
          '<%= yeoman.client %>/{app,components}/**/*.mock.js'
        ]
      }
    },

    // Empties folders to start fresh
    clean: {
      dist: {
        files: [{
          dot: true,
          src: [
            '.tmp',
            '<%= yeoman.dist %>/*',
            '!<%= yeoman.dist %>/.git*',
            '!<%= yeoman.dist %>/.openshift',
            '!<%= yeoman.dist %>/Procfile'
          ]
        }]
      },
      server: '.tmp'
    },

    // Add vendor prefixed styles
    autoprefixer: {
      options: {
        browsers: ['last 1 version']
      },
      dist: {
        files: [{
          expand: true,
          cwd: '.tmp/',
          src: '{,*/}*.css',
          dest: '.tmp/'
        }]
      }
    },

    // Debugging with node inspector
    'node-inspector': {
      custom: {
        options: {
          'web-host': 'localhost'
        }
      }
    },

    // Use nodemon to run server in debug mode with an initial breakpoint
    nodemon: {
      debug: {
        script: 'server/app.js',
        options: {
          nodeArgs: ['--debug-brk'],
          env: {
            PORT: process.env.PORT || 9000
          },
          callback: function (nodemon) {
            nodemon.on('log', function (event) {
              console.log(event.colour);
            });

            // opens browser on initial server start
            nodemon.on('config:update', function () {
              setTimeout(function () {
                require('open')('http://localhost:8080/debug?port=5858');
              }, 500);
            });
          }
        }
      }
    },

    // Automatically inject Bower components into the app
    wiredep: {
      target: {
        src: '<%= yeoman.client %>/index.html',
        ignorePath: '<%= yeoman.client %>/',
        exclude: ['exporting.js', '/foundation.js/', '/foundation.css/', /bootstrap-sass-official/, /bootstrap.js/, '/json3/', '/es5-shim/']
      }
    },

    // Renames files for browser caching purposes
    rev: {
      dist: {
        files: {
          src: [
            // '<%= yeoman.dist %>/public/{,*/}*.js',
            '<%= yeoman.dist %>/public/app/{,*/}*.js',
            '<%= yeoman.dist %>/public/assets/{,*/}*.js',
            '<%= yeoman.dist %>/public/{,*/}*.css',
            // '<%= yeoman.dist %>/public/assets/images/{,*/}*.{png,jpg,jpeg,gif,webp,svg}',
            '<%= yeoman.dist %>/public/assets/fonts/*'
          ]
        }
      }
    },

    // Reads HTML for usemin blocks to enable smart builds that automatically
    // concat, minify and revision files. Creates configurations in memory so
    // additional tasks can operate on them
    useminPrepare: {
      html: ['<%= yeoman.client %>/index.html'],
      options: {
        dest: '<%= yeoman.dist %>/public'
      }
    },

    // Performs rewrites based on rev and the useminPrepare configuration
    usemin: {
      html: ['<%= yeoman.dist %>/public/{,*/}*.html'],
      css: ['<%= yeoman.dist %>/public/{,*/}*.css'],
      js: [
        // '<%= yeoman.dist %>/public/{,*/}*.js'
        '<%= yeoman.dist %>/public/app/{,*/}*.js',
        '<%= yeoman.dist %>/public/assets/{,*/}*.js'
      ],
      options: {
        assetsDirs: [
          '<%= yeoman.dist %>/public',
          '<%= yeoman.dist %>/public/assets/images'
        ],
        // This is so we update image references in our ng-templates
        patterns: {
          js: [
            [/(assets\/images\/.*?\.(?:gif|jpeg|jpg|png|webp|svg))/gm, 'Update the JS to reference our revved images']
          ]
        }
      }
    },

    // The following *-min tasks produce minified files in the dist folder
    imagemin: {
      dist: {
        files: [{
          expand: true,
          cwd: '<%= yeoman.client %>/assets/images',
          src: '{,*/}*.{png,jpg,jpeg,gif}',
          dest: '<%= yeoman.dist %>/public/assets/images'
        }]
      }
    },

    svgmin: {
      dist: {
        files: [{
          expand: true,
          cwd: '<%= yeoman.client %>/assets/images',
          src: '{,*/}*.svg',
          dest: '<%= yeoman.dist %>/public/assets/images'
        }]
      }
    },

    // Allow the use of non-minsafe AngularJS files. Automatically makes it
    // minsafe compatible so Uglify does not destroy the ng references
    ngAnnotate: {
      dist: {
        files: [{
          expand: true,
          cwd: '.tmp/concat',
          src: '*/**.js',
          dest: '.tmp/concat'
        }]
      }
    },

    // Package all the html partials into a single javascript payload
    ngtemplates: {
      options: {
        // This should be the name of your apps angular module
        module: 'myApp',
        htmlmin: {
          collapseBooleanAttributes: true,
          collapseWhitespace: true,
          removeAttributeQuotes: true,
          removeEmptyAttributes: true,
          removeRedundantAttributes: false,
          removeScriptTypeAttributes: true,
          removeStyleLinkTypeAttributes: true
        },
        usemin: 'app/app.js'
      },
      main: {
        cwd: '<%= yeoman.client %>',
        src: ['{app,components}/**/*.html'],
        dest: '.tmp/templates.js'
      },
      tmp: {
        cwd: '.tmp',
        src: ['{app,components}/**/*.html'],
        dest: '.tmp/tmp-templates.js'
      }
    },

    // Replace Google CDN references
    cdnify: {
      dist: {
        html: ['<%= yeoman.dist %>/public/*.html']
      }
    },

    // Copies remaining files to places other tasks can use
    copy: {
      dist: {
        files: [{
          expand: true,
          dot: true,
          cwd: '<%= yeoman.client %>',
          dest: '<%= yeoman.dist %>/public',
          src: [
            '*.{ico,png,txt}',
            '.htaccess',
            'bower_components/**/*',
            'assets/images/{,*/}*.{webp}',
            'assets/fonts/**/*',
            'index.html'
          ]
        }, {
          expand: true,
          cwd: '.tmp/images',
          dest: '<%= yeoman.dist %>/public/assets/images',
          src: ['generated/*']
        }, {
          expand: true,
          dest: '<%= yeoman.dist %>',
          src: [
            'package.json',
            'server/**/*'
          ]
        }]
      },
      styles: {
        expand: true,
        cwd: '<%= yeoman.client %>',
        dest: '.tmp/',
        src: ['{app,components}/**/*.css']
      }
    },

    buildcontrol: {
      options: {
        dir: 'dist',
        commit: true,
        push: true,
        connectCommits: false,
        message: 'Built %sourceName% from commit %sourceCommit% on branch %sourceBranch%'
      },
      beta: {
        options: {
          remote: 'git@heroku.com:secure-mesa-9387.git',
          branch: 'master',
          force: true
        }
      },
      master: {
        options: {
          // remote: 'git@heroku.com:lit-thicket-88494.git',
          remote: 'git@heroku.com:sheltered-bayou-9283.git',
          branch: 'master'
        }
      }
    },

    concurrent: {
      server: [
        'sass',
      ],
      test: [
        'sass',
      ],
      debug: {
        tasks: [
          'nodemon',
          'node-inspector'
        ],
        options: {
          logConcurrentOutput: true
        }
      },
      dist: [
        // 'sass',
        'imagemin',
        'svgmin'
      ]
    },

    // Test settings
    karma: {
      unit: {
        configFile: 'karma.conf.js',
        singleRun: true,
        browsers: ['PhantomJS2'],
        browserNoActivityTimeout: 30000
      }
    },

    mochaTest: {
      options: {
        reporter: 'spec'
      },
      src: ['server/**/*.spec.js']
    },

    protractor: {
      options: {
        configFile: 'protractor.conf.js'
      },
      chrome: {
        options: {
          args: {
            browser: 'chrome'
          }
        }
      }
    },

    env: {
      test: {
        NODE_ENV: 'test'
      },
      prod: {
        NODE_ENV: 'production'
      },
      all: localConfig
    },

    sass: {
      server: {
        options: {
          // includePaths: ['bower_components/foundation/scss'],
          loadPath: [
            '<%= yeoman.client %>/bower_components/foundation/scss',
            '<%= yeoman.client %>/bower_components',
            '<%= yeoman.client %>/app',
            '<%= yeoman.client %>/components'
          ],
          compass: false
        },
        files: {
          '.tmp/app/app.css' : '<%= yeoman.client %>/app/app.scss'
        }
      }
    },

    injector: {
      // Inject application script files into index.html (doesn't include bower)
      scripts: {
        options: {
          transform: function(filePath) {
            filePath = filePath.replace('/client/', '');
            filePath = filePath.replace('/.tmp/', '');
            return '<script src="' + filePath + '"></script>';
          },
          starttag: '<!-- injector:js -->',
          endtag: '<!-- endinjector -->'
        },
        files: {
          '<%= yeoman.client %>/index.html': [
              ['{.tmp,<%= yeoman.client %>}/{app,components,scripts}/**/*.js',
               '!{.tmp,<%= yeoman.client %>}/app/app.js',
               '!{.tmp,<%= yeoman.client %>}/{app,components}/**/*.spec.js',
               '!{.tmp,<%= yeoman.client %>}/{app,components}/**/*.mock.js']
            ]
        }
      },

      sass: {
        options: {
          transform: function(filePath) {
            filePath = filePath.replace('/client/app/', '');
            filePath = filePath.replace('/client/components/', '');
            return '@import \'' + filePath + '\';';
          },
          starttag: '// injector',
          endtag: '// endinjector'
        },
        files: {
          '<%= yeoman.client %>/app/app.scss': [
            '<%= yeoman.client %>/{app,components}/**/*.{scss,sass}',
            '!<%= yeoman.client %>/app/app.{scss,sass}'
          ]
        }
      },

      // Inject component css into index.html
      css: {
        options: {
          transform: function(filePath) {
            filePath = filePath.replace('/client/', '');
            filePath = filePath.replace('/.tmp/', '');
            return '<link rel="stylesheet" href="' + filePath + '">';
          },
          starttag: '<!-- injector:css -->',
          endtag: '<!-- endinjector -->'
        },
        files: {
          '<%= yeoman.client %>/index.html': [
            '<%= yeoman.client %>/{app,components}/**/*.css'
          ]
        }
      }
    },
  });

  // Used for delaying livereload until after server has restarted
  grunt.registerTask('wait', function () {
    grunt.log.ok('Waiting for server reload...');

    var done = this.async();

    setTimeout(function () {
      grunt.log.writeln('Done waiting!');
      done();
    }, 1500);
  });

  grunt.registerTask('express-keepalive', 'Keep grunt running', function() {
    this.async();
  });

  grunt.registerTask('configServer', function(target) {
      var output = "// Generated! Do not edit!\n"
                   + "'use strict';module.exports = ";
      output += JSON.stringify(config.server.env);
      output += ';';

      grunt.file.write('./server/config/local-config.js', output,
                       { encoding: 'utf-8' });
  });

  grunt.registerTask('serve', function (target) {
    if (target === 'dist') {
      return grunt.task.run(['build', 'env:all', 'env:prod', 'express:prod', 'wait', 'open', 'express-keepalive']);
    }

    if (target === 'debug') {
      return grunt.task.run([
        'clean:server',
        'env:all',
        'concurrent:server',
        'wiredep',
        'autoprefixer',
        'concurrent:debug'
      ]);
    }

    grunt.task.run([
      'clean:server',
      'configServer',
      'ngconstant:development',
      'env:all',
      'concurrent:server',
      'wiredep',
      'autoprefixer',
      'express:dev',
      'wait',
      'open',
      'watch'
    ]);
  });

  // grunt.registerTask('test', ['karma:travis']);

  grunt.registerTask('build-beta', [
    'clean:dist',
    'ngconstant:beta',
    'concurrent:dist',
    'wiredep',
    'useminPrepare',
    'autoprefixer',
    'ngtemplates',
    'concat',
    'ngAnnotate',
    'copy:dist',
    'all-po',
    'cdnify',
    'cssmin',
    'uglify',
    'rev',
    'usemin'
  ]);

  grunt.registerTask('build', [
    'clean:dist',
    'ngconstant:production',
    'concurrent:dist',
    'wiredep',
    'useminPrepare',
    'autoprefixer',
    'ngtemplates',
    'concat',
    'ngAnnotate',
    'copy:dist',
    'all-po',
    'cdnify',
    'cssmin',
    'uglify',
    'rev',
    'usemin'
  ]);

  grunt.registerTask('po/POTFILES',
                   'Collect files containing translatable strings',
                   function() {
    grunt.log.debug('Collecting files with translatable messages');

    var output = '',
        found = grunt.file.expand(potfiles);

    found.forEach(function(filename) {
      output += '../' + filename + '\n';
    });

      try {
          grunt.file.write('po/POTFILES', output, {encoding: 'utf-8'});
      } catch(e) {
          console.log(e);
          grunt.log.error(e.message);
      }
  });

  grunt.registerTask('pot', [
    'nggettext_extract'
  ]);

  grunt.registerTask('update-po', [
    'msgInitMerge'
  ]);

  grunt.registerTask('install-po', [
    'potomo',
    'nggettext_compile'
  ]);

  grunt.registerTask('all-po', [
    'po/POTFILES',
    'pot',
    'update-po',
    'install-po'
  ]);

  grunt.loadNpmTasks('grunt-msg-init-merge');
  grunt.loadNpmTasks('grunt-potomo');
  grunt.loadNpmTasks('grunt-angular-gettext');

  grunt.registerTask('server', function () {
    grunt.log.warn('The `server` task has been deprecated. Use `grunt serve` to start a server.');
    grunt.task.run(['serve']);
  });

  grunt.registerTask('test', function(target) {
    if (target === 'server') {
      return grunt.task.run([
        'env:all',
        'env:test',
        'mochaTest'
      ]);
    }

    else if (target === 'client') {
      return grunt.task.run([
        'clean:server',
        'env:all',
        'concurrent:test',
        // 'injector:sass',
        'autoprefixer',
        'karma'
      ]);
    }

    else if (target === 'e2e') {
      return grunt.task.run([
        'clean:server',
        'env:all',
        'env:test',
        'concurrent:test',
        // 'injector:sass',
        'wiredep',
        'autoprefixer',
        'express:dev',
        'protractor'
      ]);
    }

    else grunt.task.run([
      'ngconstant:test',
      'test:server',
      'test:client'
    ]);
  });

  // grunt.loadNpmTasks('grunt-sass');
  // grunt.loadNpmTasks('grunt-contrib-watch');

  grunt.registerTask('default', [
    'newer:jshint',
    'test',
    'build'
  ]);
};
