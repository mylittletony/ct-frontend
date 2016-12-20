#!/bin/bash

git config --global user.email "simon@polkaspots.com"
git config --global user.name "Simon Morley"

echo yes | heroku keys:add

if [ "${CIRCLE_BRANCH}" == "master" ]
then
  echo 'Building master.'
  grunt build
else
  echo 'Building beta.'
  grunt build-beta
fi

rm -rf dist/.git*

echo 'Deploying EU repo'
yes | grunt buildcontrol:$CIRCLE_BRANCH

rm -rf dist/.git*

if [ "${CIRCLE_BRANCH}" == "master" ]
then
  echo 'Deploying US repo'
  yes | grunt buildcontrol:usa
fi

echo "...done."
