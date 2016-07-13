FROM node:latest
 
MAINTAINER Cucumber WiFi

ADD package.json /tmp/package.json
ADD bower.json /tmp/bower.json

RUN \
    cd /tmp && \
    npm install -g bower && \
    npm install && \
    bower install --config.interactive=false --allow-root

RUN mkdir -p /opt/app && cp -a /tmp/node_modules /opt/app
 
WORKDIR /opt/app

ADD . /opt/app

EXPOSE 9000

CMD ["node", "server/app.js"]
