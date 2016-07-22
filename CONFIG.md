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
