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

### Using with Heroku 

If you want to deploy yourself with Heroku, you need to do a few things.

**Create a Heroku repository and add to the Gruntfile**

```
heroku: {
  options: {
    remote: 'git@heroku.com:my-app-8983.git',
    branch: 'master'
  }
}
```

**Add some ENV variables to your Heroku Repo**

You need to add:

-APP_ID=YOUR-APP-ID
-APP_SECRET=YOUR-SECRET
-CT_URL=your-dash-url
-NODE_ENV=production

Then you can deploy with:

```
grunt buildcontrol:heroku
```
