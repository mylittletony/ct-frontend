'use strict';

var app = angular.module('myApp.campaigns.filters', []);

app.filter('humanPredicate', [ 'gettextCatalog', function(gettextCatalog) {
  var isNumber = function(number) {
    if (Number.isInteger(number / 1)) {
      return true;
    }
  };

  return function(predicate) {
    if (predicate === '' || predicate === undefined || predicate === null) {
      return;
    }

    var phrase, attr;

    switch(predicate.attribute) {
      case 'created_at':
        attr = 'Signed up';
        break;
      case 'last_seen':
        attr = 'Last seen';
        break;
      case 'login_count':
        attr = 'Logins';
        break;
      case 'email':
        attr = 'Email address';
        break;
    }

    if (predicate.attribute === 'email') {
      return attr + ' matches ' + predicate.value;
    }

    if (predicate.attribute === 'login_count') {
      if (predicate.operator === 'gte') {
        phrase = 'more than';
      } else {
        phrase = 'less than';
      }
      return attr + ' ' + phrase + ' ' + (predicate.value || 0) + ' logins';
    }

    if (isNumber(predicate.value)) {
      if (predicate.operator === 'gte') {
        phrase = 'less than';
      } else if (predicate.operator === 'lte') {
        phrase = 'more than';
      } else {
        phrase = 'exactly';
      }

      return attr + ' ' + phrase + ' ' + predicate.value + ' days ago';
    }

    if (predicate.operator === 'gte') {
      phrase = 'after';
    } else if (predicate.operator === 'lte') {
      phrase = 'before';
    } else {
      phrase = 'on';
    }

    return attr + ' ' + phrase + ' the ' + predicate.value;
  };
}]);
