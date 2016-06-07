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

- APP_ID=YOUR-APP-ID
- APP_SECRET=YOUR-SECRET
- CT_URL=your-dash-url
- NODE_ENV=production

Then you can deploy with:

```
grunt buildcontrol:heroku
```

###Running Locally

This is a pain right now since you'll need to use the production end-points. However, it's 100% possible. All you need to do is check the development section of the Gruntfile include the api.ctapp.io end-points.

Then run:

```
grunt serve
```

## Copyright and License

MIT License

Copyright (c) 2016 Cucumber Tony Limited

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
