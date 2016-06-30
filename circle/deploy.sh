#!/bin/sh -e

git config --global user.email "simon@polkaspots.com"
git config --global user.name "Simon Morley"

echo yes | heroku keys:add

grunt build
yes | grunt buildcontrol:$CIRCLE_BRANCH

echo "...done."
