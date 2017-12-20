# Welcome To CT

CT is an orchestration tool for WiFi Devices. It's like mission control for your networks - a single-pane of glass to manage all your devices. (That whole sentence is trademarked btw).

The core of the service is the CT RESTFul API. This portal is currently our beta portal - soon to be production. It communicates with the API to provide a 'nice' interface for controlling your devices.

It's proof that anything is possible. Just use your imagination.

## Code Status

[![CircleCI](https://circleci.com/gh/cucumber-tony/cucumber-frontend.svg?style=svg)](https://circleci.com/gh/cucumber-tony/cucumber-frontend)

## Getting Started

This is a demo portal which acts as an interface to the CT API. It's not production ready and many tests were temporarily removed.

There's two ways to run the application:

- Using Docker
- Using plain NodeJS / npm

### Running with NodeJS

- Create an Application in the current Tony and obtain your APP ID and Secret
- Enter these in the local.enc.sample.js.default. Or use some ENV variables.

You also need to install via npm install && bower install to get all the dependencies.

```
npm install
bower install
```

To run in development, you can use the following:

```
grunt serve
```

**Make sure you have updated the Gruntfile to include the api.ctapp.io end-points.**

### Using With Docker

Make sure you have Docker and Docker Compose installed. Full instructions on the Docker site. If you want to use docker-compose, please ensure you're using the version > 1.7 otherwise you will get an error.

You can either use docker compose or plain docker build. It's up to you. With docker compose, you can create a .env file that will pull all your ENV vars in. In the project directory run:

Make sure to edit it the cucumber.env file first accordingly.

```
docker-compose up
 ```

Then you should be able to access your container on your Docker IP:

```
curl http://192.168.1.1:8080
```

If you don't want to use docker compose, just run the following in your project root:

```
docker build -t cucumber .
```

Followed by:

```
docker run \
  -e APP_ID=YOUR-ID \
  -e APP_SECRET=YOUR-SECRET \
  -e API_URL=https://api.ctapp.io \
  -e AUTH_URL=https://id.ctapp.io \
  -e BASE_URL=my.ctapp.dev:9090 \
  -e PORT=80
  -p 8080:80 cucumber
```

Replacing all the vars as you see fit.

#### Still to sort

We have not implemented TLS yet. This will come soon - basically don't use this in production yet.

## Using with Heroku

These instructions assume you're not using the Docker image, we will explain that later.

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
- CT_URL=your-local-dash-url
- NODE_ENV=production

Then you can deploy with:

```
grunt buildcontrol:heroku
```

## Push Notifications

TBC. We should detail what notifications we use, including the channels in use. Think this is going to take some work since we have dozens coming from multiple services.

For now, use the code samples etc. to figure it out.

## Translations

TBC

## Contributing

### Issues

Search before posting. Describe your issue in detail. **Do not raise an issue if you have a problem with the API**. Front-end only please.

### Code

There's now contributing guide available which guides you through how we roll.

## Copyright and License

MIT License

Copyright (c) 2016 CT Limited

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
