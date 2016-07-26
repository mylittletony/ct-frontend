Configuration Of Cucumber-Frontend
==================================

Note! The below currently only applies to the "development" environment
of cucumber-frontend.  Configuration for "test", "beta", and "production"
is hard-coded.

All configuration is done in the file `local-config.js`.  For a starting
point, copy `local-config.sample.js` to `local-config.js`.  To see all
configuration options, have a look at `default-config.js`.

Configuration
=============

Some variables always have to be configured in `local-config.js`:

* server.env.APP_ID
* server.env.APP_SECRET
* server.env.callbackURL
* server.env.authorizationURL
* server.env.profileURL
* server.env.tokenURL
* server.env.baseURL

Additionally, you will often want to override these variables:

* frontend.constants.API_END_POINT
* frontend.constants.API_URL
* frontend.constants.AUTH_URL

How It Works
============

The `Gruntfile.js` sources `default-config.js` which is a commented javascript
file, initializing all configurable values to their defaults.  It then sources
`local-config.js` and merges the values configured there into the default
configuration.  Internally, this uses the `merge()` function of
[lodash](https://lodash.com/).

The configuration subtree `server.env` is written to the file
`server/config/local-config.js`.  This file is sourced conditionally by
`server/config/local.env.sample.js`.  Note that the old include file
`server/config/local.constants.js` is no longer used.

AngularJS Application
---------------------

The object `frontend.constants` is injected into the module `config`.
You can inject all keys of `frontend.constants` wherever you like in the
javascript files.

The object `frontend.constants.CONFIG` is exposed as `$rootScope.CONFIG`
so that you can access it from the view files as well.  Consider this
excerpt from the configuration:

```
frontend: {
    constants: {
        CONFIG: {
            html: {
                header: '/custom/views/header.html'
            }
        }
    }
}
```

You can now access this variable in view files like this:

<pre>&lt;div>
    &lt;ng-include src="CONFIG.html.header">&lt;/ng-include>
&lt;/div></pre>

In JavaScript files you have the choice.  You can either add `CONFIG`
as a dependency and just use it, or - if you already depend on `$rootScope`
you can alternatively just access it as `$rootScope.CONFIG`.

Gruntfile
---------

In `Gruntfile.js` you can access the variables directly as `config`.

The tricky part is to extend existing constants, for example list of
files.  Say you have something like this somewhere in `Gruntfile.js`.

    grunt: {
        paths: {
            sassFiles: [
                'this.scss',
                'that.scss'
            ]
        }
    }

In order to make this list extendable, introduce a new default variable in
`default-config.js`:

    grunt: {
        paths: {
           sassFiles: []
        }
    }

In other words: the extension is the empty array by default. Then change 
`Gruntfile.js` so that it reads:

    grunt: {
        paths: {
            sassFiles: _.concat([
                'this.scss',
                'that.scss'
            ], config.grunt.paths.sassFiles)
        }
    }

This will unfold the corresponding array from the default resp. local
configuration (if you override it), and push it on top of the values
from `Gruntfile.js`.  See [the documentation for `_.concat()`](https://lodash.com/docs#concat) for details.

Extending the list is now easy.  In `local-config.js` you write:

    grunt: {
        paths: {
            sassFiles: [
                'more.scss',
                'other.scss'
            ]
        }
    }

At the end of the day, the variable `grunt.paths.sassFiles` will now 
contain the array `['this.scss', 'that.scss', 'more.scss', 'other.scss']`.

