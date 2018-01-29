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
    
    var phrase;
    if (predicate.attribute === 'login_count') {
      if (predicate.operator === 'gte') {
        phrase = 'More than';
      } else {
        phrase = 'Less than';
      }
      return phrase + ' ' + predicate.value + ' logins';
    }

    if (isNumber(predicate.value)) {
      if (predicate.operator === 'gte') {
        phrase = 'More than';
      } else if (predicate.operator === 'lte') {
        phrase = 'Less than';
      } else {
        phrase = 'Exactly';
      }

      return phrase + ' ' + predicate.value + ' days ago';
    }

    if (predicate.operator === 'gte') {
      phrase = 'After';
    } else if (predicate.operator === 'lte') {
      phrase = 'Before';
    } else {
      phrase = 'On';
    }

    return phrase + ' the ' + predicate.value;
  };
}]);
