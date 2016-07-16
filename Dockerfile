FROM node:4.4

MAINTAINER Cucumber WiFi

RUN \
  apt-get update && \
  apt-get install -y \
  ruby ruby-dev build-essential rubygems

ADD package.json /tmp/package.json
ADD bower.json /tmp/bower.json

RUN \
  gem install sass

RUN \
    cd /tmp && \
    npm install -g bower grunt grunt-cli urijs

RUN \
    cd /tmp && \
    npm install
    # && \
    # grunt-svgmin grunt-rev --save \
    # grunt-contrib-sass urijs grunt-autoprefixer && \

# RUN \
#   cd /tmp && \
#   npm install grunt-contrib-sass grunt-autoprefixer

RUN \
  cd /tmp && \
  bower install --config.interactive=false --allow-root
  # npm install grunt-cli

RUN cd /tmp && grunt build

RUN mkdir -p /opt/app && cp -a /tmp/node_modules /opt/app

WORKDIR /opt/app

ADD . /opt/app

EXPOSE 9000

CMD ["node", "server/app.js"]
