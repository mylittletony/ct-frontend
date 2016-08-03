'use strict';

describe("Auth Service Unit Tests", function() {

  beforeEach(module('myApp'));

  var Auth, Me, localStorage = {}, httpBackend = null;

  beforeEach(inject(function (_Auth_, _Me_, $localStorage) {
    Auth = _Auth_;
    Me = _Me_;
    localStorage = $localStorage;
  }));

  var $httpBackend;

  // OMG annoying tests
  // it('should have Auth service be defined', function () {
  //   expect(Auth).toBeDefined();
  // });

  // it('should not have a user existing upon starting up', function() {
  //   expect(Auth.currentUser()).toBe(undefined);
  // });

  // it('should save a user', function() {
  //   var user = { username: 'Simon-Morley', slug: 1, token: 1123, refresh_token: 567765, role_id: 4 };
  //   Auth.saveUser(user);
  //   var currUser = Auth.currentUser();
  //   expect(currUser.username).toBe(user.username);
  //   expect(currUser.slug).toBe(user.slug);
  //   expect(currUser.role_id).toBe(user.role_id);
  //   expect(currUser.access_token).toBe(user.access_token);
  //   expect(currUser.refresh_token).toBe(user.refresh_token);
  //   expect(localStorage.user).toBe(user);
  // });

  it('should log a user in with an access token and then save the fucking user from the me.json callback', function() {
    var user = { username: 'Simon-Morley', slug: 1, access_token: 123, refresh_token: 4876, account_id:876876 };
    localStorage.user = user
    Auth.login(user, function(u){});
    var currUser = Auth.currentUser();
    expect(currUser.username).toBe(user.username);
    expect(currUser.access_token).toBe(user.access_token);
    expect(currUser.refresh_token).toBe(user.refresh_token);
  })

  describe("Location Service Unit Tests", function() {

    var $httpBackend;
    var name = 'Josh Bavari';
    var email = 'sm@polkaspots.com';

    beforeEach(inject(function($injector) {
      $httpBackend = $injector.get('$httpBackend');
      $httpBackend.when('POST', 'http://mywifi.dev:8080/api/v1/me.json')
      .respond(200, {name: name, email: email, success: true});

      $httpBackend.whenGET('/translations/en_GB.json').respond("");
    }));

    afterEach(function() {
      $httpBackend.verifyNoOutstandingExpectation();
      $httpBackend.verifyNoOutstandingRequest();
    });


    xit('should have sent a POST request to the checkuser API', function() {
      var result = Auth.checkUser(name, email, 1, '4408064001', null);
      $httpBackend.expectPOST('http://mywifi.dev:8080/api/v1/me.json');
      $httpBackend.flush();
    });

  })
})

describe("Tests Me.JSON Tests", function() {

  beforeEach(module('myApp'));

  var Me,
  httpBackend = null;

  beforeEach(inject(function (_Me_) {
    Me = _Me_;
  }));

  describe("Me.json Unit Tests", function() {

    var $httpBackend;

    beforeEach(inject(function($injector) {
      $httpBackend = $injector.get('$httpBackend');
      $httpBackend.when('GET', 'http://mywifi.dev:8080/api/v1/me.json?access_token=123')
      .respond(200, {});
      $httpBackend.whenGET('/translations/en_GB.json').respond("");
    }));

    afterEach(function() {
      $httpBackend.verifyNoOutstandingExpectation();
      $httpBackend.verifyNoOutstandingRequest();
    });


    it('should have sent a GET request to users.me.json', function() {
      var result = Me.get({access_token: 123});
      $httpBackend.expectGET('http://mywifi.dev:8080/api/v1/me.json?access_token=123');
      $httpBackend.flush();
    });

  })

})

describe("RESTful Tests", function() {

  beforeEach(module('myApp'));

  var $httpBackend;
  var User;

  beforeEach(inject(function($injector, _User_) {

    User = _User_;
    $httpBackend = $injector.get('$httpBackend');

    $httpBackend.when('GET', 'http://mywifi.dev:8080/api/v1/users')
    .respond(200, [{}]);

    $httpBackend.when('GET', 'http://mywifi.dev:8080/api/v1/users/123')
    .respond(200, {});

    $httpBackend.when('GET', 'http://mywifi.dev:8080/api/v1/users/123/user_sessions')
    .respond(200, {});

    $httpBackend.when('PATCH', 'http://mywifi.dev:8080/api/v1/users/123')
    .respond(200, {});

    $httpBackend.when('POST', 'http://mywifi.dev:8080/api/v1/users/123/logout_all')
    .respond(200, {});

    $httpBackend.when('POST', 'http://mywifi.dev:8080/api/v1/users/switch')
    .respond(200, {});

    $httpBackend.when('POST', 'http://mywifi.dev:8080/api/v1/users/distro?dst=123')
    .respond(200, {});

    $httpBackend.whenGET('/translations/en_GB.json').respond("");
  }));

  afterEach(function() {
    $httpBackend.verifyNoOutstandingExpectation();
    $httpBackend.verifyNoOutstandingRequest();
  });

  it('should have sent a GET request to get the users', function() {
    var result = User.get()
    $httpBackend.expectGET('http://mywifi.dev:8080/api/v1/users')
    $httpBackend.flush();
  });

  it('should have sent a GET request to get the users', function() {
    var result = User.query({id: 123})
    $httpBackend.expectGET('http://mywifi.dev:8080/api/v1/users/123')
    $httpBackend.flush();
  });

  it('should have sent a GET request to get the user sessions', function() {
    var result = User.sessions({id: 123})
    $httpBackend.expectGET('http://mywifi.dev:8080/api/v1/users/123/user_sessions')
    $httpBackend.flush();
  });

  it('should have sent a patch req. to update the user', function() {
    var result = User.update({id: 123})
    $httpBackend.expectPATCH('http://mywifi.dev:8080/api/v1/users/123')
    $httpBackend.flush();
  });

  it('should have sent a post req. to clear all sessions', function() {
    var result = User.logout_all({id: 123})
    $httpBackend.expectPOST('http://mywifi.dev:8080/api/v1/users/123/logout_all')
    $httpBackend.flush();
  });

  it('should have sent a post req. to switch sessions', function() {
    var result = User.switcher({id: 123})
    $httpBackend.expectPOST('http://mywifi.dev:8080/api/v1/users/switch')
    $httpBackend.flush();
  });

  it('should have sent a post req. to create the distro link', function() {
    var result = User.distro({id: 123})
    $httpBackend.expectPOST('http://mywifi.dev:8080/api/v1/users/distro?dst=123')
    $httpBackend.flush();
  });

});

describe("User Settings Tests", function() {

  beforeEach(module('myApp'));

  var $httpBackend;
  var UserSettings;

  beforeEach(inject(function($injector, _UserSettings_) {

    UserSettings = _UserSettings_;
    $httpBackend = $injector.get('$httpBackend');

    $httpBackend.when('GET', 'http://mywifi.dev:8080/api/v1/user_settings')
    .respond(200, {});

    $httpBackend.when('PATCH', 'http://mywifi.dev:8080/api/v1/user_settings')
    .respond(200, {});

    $httpBackend.whenGET('/translations/en_GB.json').respond("");
  }));

  afterEach(function() {
    $httpBackend.verifyNoOutstandingExpectation();
    $httpBackend.verifyNoOutstandingRequest();
  });

  it('should have sent a GET request to get the users', function() {
    var result = UserSettings.get()
    $httpBackend.expectGET('http://mywifi.dev:8080/api/v1/user_settings')
    $httpBackend.flush();
  });

  it('should have sent a GET request to get the users', function() {
    var result = UserSettings.update()
    $httpBackend.expectPATCH('http://mywifi.dev:8080/api/v1/user_settings')
    $httpBackend.flush();
  });

});

