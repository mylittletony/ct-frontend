## Welcome To Cucumber

This is a demo portal which acts as an interface to the Cucumber API.

To run it:

- Move Gruntfile.js.default to Gruntfile.js
- Move local.env.sample.js.default to local.env.sample.js
- Create an Application in the current Tony and obtain your APP ID and Secret
- Enter these in the local.enc.sample.js.default. Or use some ENV variables.

You also need to install via npm install && bower install to get all the dependencies.

To run, you can try something like this:

```
CT_URL=api.ctapp.io npm start
```

Where CT_URL is the callback URL for the oauth flow.

And the rest is history.

The tests DO NOT RUN at the moment since we've moved massive sections out. These will be back in action shortly.




