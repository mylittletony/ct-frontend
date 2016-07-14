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

yes | grunt buildcontrol:$CIRCLE_BRANCH

echo "...done."
