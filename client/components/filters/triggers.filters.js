'use strict';

var app = angular.module('myApp.triggers.filters', []);

app.filter('humanTrigger', [ 'gettextCatalog', function(gettextCatalog) {
  return function(input) {
    if (input === '' || input === undefined || input === null) {
      return input;
    } else {
      switch(input) {
        case 'box':
          return gettextCatalog.getString('When a box is');
        case 'client':
          return gettextCatalog.getString('When a client');
        case 'email':
          return gettextCatalog.getString('When an email is');
        case 'guest':
          return gettextCatalog.getString('When a guest is');
        case 'location':
          return gettextCatalog.getString('When a location is');
        case 'network':
          return gettextCatalog.getString('When a network / SSID is');
        case 'splash':
          return gettextCatalog.getString('When a splash page is');
        case 'social':
          return gettextCatalog.getString('When a Social is');
        case 'voucher':
          return gettextCatalog.getString('When a voucher is');
        case 'zone':
          return gettextCatalog.getString('When a zone is');
      }
    }
  };
}]);

app.filter('humanTriggerAction', ['gettextCatalog', function(gettextCatalog) {
  return function(input) {
    if (input === '' || input === undefined || input === null) {
      return input;
    } else {
      var sp = input.split('.');
      var object = sp[0];
      var action = sp[1];
      switch(action) {
        case 'create':
          return gettextCatalog.getString('When a {{object}} is created', {object: object});
        case 'update':
            return gettextCatalog.getString('When a {{object}} is updated', {object: object});
        case 'destroy':
            return gettextCatalog.getString('When a {{object}} is deleted', {object: object});
        case 'online':
            return gettextCatalog.getString('When a {{object}} goes online', {object: object});
        case 'offline':
            return gettextCatalog.getString('When a {{object}} goes offline', {object: object});
        case 'reset':
            return gettextCatalog.getString('When a {{object}} is reset', {object: object});
        case 'resync':
            return gettextCatalog.getString('When a {{object}} is resynced', {object: object});
        case 'transfer':
            return gettextCatalog.getString('When a {{object}} is transferred', {object: object});
        case 'archive':
            return gettextCatalog.getString('Wnen a {{object}} is archived', {object: object});
        case 'unarchive':
            return gettextCatalog.getString('When a {{object}} is restored', {object: object});
        case 'login':
            return gettextCatalog.getString('When a {{object}} logs in', {object: object});
        case 'duplicate':
            return gettextCatalog.getString('When a {{object}} is copied', {object: object});
        case 'refund':
            return gettextCatalog.getString('When an order is refunded');
        case 'purchase':
            return gettextCatalog.getString('When a purchase happens');
        case 'generate':
            return gettextCatalog.getString('When your codes have generated');
      }
    }
  };
}]);

app.filter('filterChannel', function() {
  return function(input) {
    if (input === '' || input === undefined || input === null) {
      return input;
    } else {
      switch(input) {
        case 'sms':
          return gettextCatalog.getString('send an SMS.');
        case 'email':
          return gettextCatalog.getString('send an Email.');
        case 'webhook':
          return gettextCatalog.getString('send a Webhook.');
        case 'slack':
          return gettextCatalog.getString('send a Slack notification.');
        case 'mailchimp':
          return gettextCatalog.getString('subscribe an email to a MailChimp list.');
      }
    }
  };
});
