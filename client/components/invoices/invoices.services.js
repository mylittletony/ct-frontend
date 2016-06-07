'use strict';

var app = angular.module('myApp.invoices.services', ['ngResource',]);

app.factory('Invoice', ['$resource', 'API_END_POINT',
  function($resource, API){

    return $resource(API + '/invoices/:id/:action',
      {
        token: '@token'
      },
      {
      get: {
        method: 'GET',
        isArray: false,
        params: {
          per: '@per',
          page: '@page'
        }
      },
      query: {
        method: 'GET',
        isArray: false,
        params: {
          id: '@id'
        }
      },
      refund: {
        method: 'POST',
        isArray: false,
        params: {
          id: '@id',
          action: 'refund'
        }
      },
      email: {
        method: 'POST',
        isArray: false,
        params: {
          ids: '@ids',
          id: 'email'
        }
      }
    }
  );
}]);

app.factory('InvoiceItem', ['$resource', 'API_END_POINT',
  function($resource, API_URL){

    return $resource(API_URL + '/invoice_items/:id',
      {
        token: '@token'
      },
      {
      query: {
        method: 'GET',
        isArray: true,
        params: {
          id: '@id'
        }
      },
    }
  );
}]);

