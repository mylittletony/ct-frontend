'use strict';

var app = angular.module('myApp.triggers.filters', []);

app.filter('humanTrigger', function() {
  return function(input) {
    if (input === '' || input === undefined || input === null) {
      return input;
    } else {
      switch(input) {
        case 'box':
          return 'When a box is';
        case 'client':
          return 'When a client';
        case 'email':
          return 'When an email is';
        case 'guest':
          return 'When a guest is';
        case 'location':
          return 'When a location is';
        case 'network':
          return 'When a network / SSID is';
        case 'splash':
          return 'When a splash page is';
        case 'social':
          return 'When a Social is';
        case 'voucher':
          return 'When a voucher is';
        case 'zone':
          return 'When a zone is';
      }
    }
  };
});

app.filter('humanTriggerAction', function() {
  return function(input) {
    if (input === '' || input === undefined || input === null) {
      return input;
    } else {
      var sp = input.split('.');
      var object = sp[0];
      var action = sp[1];
      switch(action) {
        case 'create':
          return 'When a ' + object + ' is created';
        case 'update':
            return 'When a ' + object + ' is updated';
        case 'destroy':
            return 'When a ' + object + ' is deleted';
        case 'online':
            return 'When a ' + object + ' goes online';
        case 'offline':
            return 'When a '+ object + ' goes offline';
        case 'reset':
            return 'When a ' + object + ' is reset';
        case 'resync':
            return 'When a ' + object + ' is resynced';
        case 'transfer':
            return 'When a ' + object + ' is transferred';
        case 'archive':
            return 'Wnen a ' + object + ' is archived';
        case 'unarchive':
            return 'When a ' + object + ' is restored';
        case 'login':
            return 'When a ' + object + ' logs in';
        case 'duplicate':
            return 'When a ' + object + ' is copied';
        case 'refund':
            return 'When an order is refunded';
        case 'purchase':
            return 'When a purchase happens';
        case 'generate':
            return 'When your codes have generated';
      }
    }
  };
});

app.filter('filterChannel', function() {
  return function(input) {
    if (input === '' || input === undefined || input === null) {
      return input;
    } else {
      switch(input) {
        case 'sms':
          return 'send an SMS.';
        case 'email':
          return 'send an Email.';
        case 'webhook':
          return 'send a Webhook.';
        case 'slack':
          return 'send a Slack notification.';
        case 'mailchimp':
          return 'subscribe an email to a MailChimp list.';
      }
    }
  };
});


