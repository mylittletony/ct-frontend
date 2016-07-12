FROM node:latest
 
MAINTAINER Cucumber WiFi

WORKDIR /home/app
 
ADD . /home/app
 
RUN \
    npm install -g bower && \
    npm install && \
    bower install --config.interactive=false --allow-root
 
EXPOSE 9000
