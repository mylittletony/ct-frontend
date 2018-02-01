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
      case 'updated_at':
        attr = 'Last seen';
        break;
      case 'login_count':
        attr = 'Logins';
        break;
    }

    if (predicate.attribute === 'login_count') {
      if (predicate.operator === 'gte') {
        phrase = 'more than';
      } else {
        phrase = 'less than';
      }
      return attr + ' ' + phrase + ' ' + predicate.value + ' logins';
    }

    if (isNumber(predicate.value)) {
      if (predicate.operator === 'gte') {
        phrase = 'more than';
      } else if (predicate.operator === 'lte') {
        phrase = 'less than';
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
