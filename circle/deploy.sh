#!/bin/sh -e

git config --global user.email "simon@polkaspots.com"
git config --global user.name "Simon Morley"

echo yes | heroku keys:add

if [ "$CIRCLE_BRANCH" == "master" ]
then
  grunt build
else
  grunt build-beta
fi

yes | grunt buildcontrol:$CIRCLE_BRANCH

echo "...done."
