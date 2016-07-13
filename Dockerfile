FROM node:latest
 
MAINTAINER Cucumber WiFi

WORKDIR /home/app
 
ADD . /home/app

# ADD package.json /tmp/package.json
# RUN cd /tmp && npm install
# RUN mkdir -p /opt/app && cp -a /tmp/node_modules /opt/app/

RUN \
    npm install -g bower && \
    npm install && \
    bower install --config.interactive=false --allow-root
 
EXPOSE 9000

CMD ["node", "server/app.js"]
