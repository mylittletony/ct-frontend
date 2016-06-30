'use strict';

describe("Auth Service Unit Tests", function() {

  beforeEach(module('myApp'));

  var AccessToken,
      localStorage = {},
      httpBackend = null;

  beforeEach(inject(function (_AccessToken_, _Me_, $localStorage) {
    AccessToken = _AccessToken_;
    localStorage = $localStorage;
  }));

  var $httpBackend;

  it('should set the access_token', function () {
    // expect(AccessToken.set(123)).toBe(123);
    //Fucking stupid //
    // expect(window.localStorage.accessToken).toBe(123);
  });

})

