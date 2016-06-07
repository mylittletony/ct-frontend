'use strict';

describe('splash creation, listing', function () {

  var $scope,
      element,
      deferred,
      compile,
      q,
      location,
      $location,
      boxFactory,
      networkFactory,
      codeFactory,
      splashFactory,
      splashFormFactory,
      $httpBackend,
      routeParams,
      locationFactory;

  beforeEach(module('myApp', function($provide) {
    networkFactory = {
      get: function () {
        deferred = q.defer();
        return {$promise: deferred.promise};
      }
    };
    locationFactory = {
      get: function () {
        deferred = q.defer();
        return {$promise: deferred.promise};
      },
      update: function () {
        deferred = q.defer();
        return {$promise: deferred.promise};
      }
    };
    codeFactory = {
      generate_password: function () {
        deferred = q.defer();
        return {$promise: deferred.promise};
      }
    };
    splashFormFactory = {
      update: function () {
        deferred = q.defer();
        return {$promise: deferred.promise};
      }
    };
    splashFactory = {
      store: function () {
        deferred = q.defer();
        return {$promise: deferred.promise};
      },
      create_store: function () {
        deferred = q.defer();
        return {$promise: deferred.promise};
      },
      update_store: function () {
        deferred = q.defer();
        return {$promise: deferred.promise};
      },
      destroy_store: function () {
        deferred = q.defer();
        return {$promise: deferred.promise};
      },
      duplicate: function () {
        deferred = q.defer();
        return {$promise: deferred.promise};
      },
      destroy: function () {
        deferred = q.defer();
        return {$promise: deferred.promise};
      },
      create: function () {
        deferred = q.defer();
        return {$promise: deferred.promise};
      },
      get: function () {
        deferred = q.defer();
        return {$promise: deferred.promise};
      },
      query: function () {
        deferred = q.defer();
        return {$promise: deferred.promise};
      },
      update: function () {
        deferred = q.defer();
        return {$promise: deferred.promise};
      }
    };
    $provide.value("SplashFormPage", splashFormFactory);
    $provide.value("SplashPage", splashFactory);
    $provide.value("Code", codeFactory);
    $provide.value("Location", locationFactory);
    $provide.value("Network", networkFactory);
  }));

  beforeEach(module('components/layouts/submit.html'));
  beforeEach(module('components/splash_pages/_designer.html'));
  beforeEach(module('components/splash_pages/design-sidebar.html'));
  beforeEach(module('components/splash_pages/_index.html'));
  beforeEach(module('components/splash_pages/_form.html'));
  beforeEach(module('components/splash_pages/splash_show.html'));
  beforeEach(module('components/splash_pages/access-password.html'));
  beforeEach(module('components/splash_pages/store.html'));
  beforeEach(module('components/splash_pages/view-store.html'));
  beforeEach(module('components/splash_pages/add-products.html'));

  describe('splash_pages creation, listing', function () {

    beforeEach(inject(function($compile, $rootScope, $q, $routeParams, $injector) {

      $httpBackend = $injector.get('$httpBackend');
      $httpBackend.whenGET('template/tooltip/tooltip-popup.html').respond("");

      $scope = $rootScope;
      routeParams = $routeParams;
      routeParams.new = "88888";
      routeParams.location_id = 123
      $scope.box = {};
      q = $q;
      $scope.location = { slug: 456, id: 123 }
      $scope.loading = true;
      element = angular.element('<list-splash></list-splash>');
      $compile(element)($rootScope)
      element.scope().$apply();
    }))

    it("should list all the splash pages for a location", function() {
      expect(element.isolateScope().loading).toBe(true)
      spyOn(splashFactory, 'get').andCallThrough()
      var splash = { splash_pages: [ { network_id: '123'} ] }

      expect(element.isolateScope().location.slug).toBe(123)
      deferred.resolve(splash);
      $scope.$apply()
      expect(element.isolateScope().splash_pages).toBe(splash.splash_pages)
      expect(element.isolateScope().loading).toBe(undefined)
      expect(element.isolateScope().cloned_id).toBe("88888")
    });

    it("should mark a splash with the new attribute after cloning it", function() {
      spyOn(splashFactory, 'get').andCallThrough();
      expect(element.isolateScope().loading).toBe(true)
      var splash = { splash_pages: [{ unique_id: '88888'}]};

      deferred.resolve(splash);
      $scope.$apply();
      expect(element.isolateScope().loading).toBe(undefined);
      expect(element.isolateScope().splash_pages[0].unique_id).toBe(splash.splash_pages[0].unique_id);
    });
  });

  describe('splash_pages show', function () {

    beforeEach(inject(function($compile, $rootScope, $q, $routeParams) {
      $scope = $rootScope;
      $scope.box = {};
      routeParams = $routeParams;
      routeParams.id = "slugit";
      q = $q;
      $scope.location = { slug: 456, id: 123 };
      element = angular.element('<location-splash-pages-show slug="{{location.slug}}"></location-splash_pages-show>');
      $compile(element)($rootScope);
      element.scope().$apply();
    }));

    it("should display the splash page with all scopes set", function() {
      element.isolateScope().loading = true;
      spyOn(splashFactory, 'query').andCallThrough();
      var access = {'Off': 'none', 'Timed Access': 'timed', 'Periodic': "periodic", 'Data': "data" };
      var period = { 'Daily' : 'daily', 'Weekly': 'weekly', 'Monthly': 'monthly' };
      var nts = { 'Off' : 0, 'MailChimp': 1, 'CampaignMonitor': 2, 'SendGrid': 4, 'Internal only': 3 };
      var splash = { splash_page: { available_start: '0000', available_end: '13:54', splash_page_name: 'lobby'}, access_types: [{ name: "password"}], networks: [{name: "123123"}]};
      expect(element.isolateScope().splash_loading).toBe(true);
      deferred.resolve(splash);
      $scope.$apply();
      expect(element.isolateScope().loading).toBe(undefined);
      expect(element.isolateScope().splash).toBe(splash.splash_page);
      expect(element.isolateScope().access_types).toBe(splash.access_types);
      expect(element.isolateScope().networks).toBe(splash.networks);
      // expect(element.isolateScope().splash.userdays.length).toBe(7)

      expect(JSON.stringify(element.isolateScope().access_restrict)).toBe(JSON.stringify(access));
      expect(JSON.stringify(element.isolateScope().period)).toBe(JSON.stringify(period));
      expect(JSON.stringify(element.isolateScope().newsletter_types)).toBe(JSON.stringify(nts));
    });

    it("should loop through the networks and add a checkbox next to them", function() {
      element.isolateScope().loading = true;
      spyOn(splashFactory, 'query').andCallThrough();
      var splash = { splash_page: { available_start: '0000', available_end: '13:54', splash_page_name: 'lobby', networks: ['abc']}, access_types: [{ name: "password"}], networks: [{id: "abc"}, {id: 'xyz'}]};
      deferred.resolve(splash);
      $scope.$apply();
      expect(element.isolateScope().networks).toBe(splash.networks);

      element.isolateScope().populateNetworks();
      // expect(element.isolateScope().populating).toBe(true);
      expect(element.isolateScope().networks[0].active).toBe(true);
    });

    it("should test the human access types name filter", function() {
      spyOn(splashFactory, 'query').andCallThrough()
      var splash = { splash_page: { available_start: '0000', available_end: '13:54', splash_page_name: 'lobby'}, access_types: [{ id: 1, name: "password"}, {id: 22, name: 'simon'}], networks: [{name: "123123"}]}
      deferred.resolve(splash);
      $scope.$apply()

      expect(element.isolateScope().access_types).toBe(splash.access_types)
      expect(element.isolateScope().access_name(1)).toBe('password');
      expect(element.isolateScope().access_name(22)).toBe('simon');
    });

    it("should not get the splash pages for a location", function() {
      spyOn(splashFactory, 'query').andCallThrough()
      var splash = { network_id: '123'}
      expect(element.isolateScope().splash_loading).toBe(true)
      deferred.reject({data: {errors: { base: [123]}}});
      $scope.$apply()
      expect(element.isolateScope().splash_loading).toBe(undefined)
      expect(element.isolateScope().splash.errors[0]).toBe(123)
    });

    it("should update the location when tagged logins is clicked", function() {
      element.isolateScope().myForm.$pristine = false;
      element.isolateScope().myForm.$dirty = true;
      element.isolateScope().splash = { tagged_logins: true };
      spyOn(locationFactory, 'update').andCallThrough();
      element.isolateScope().updateLocation();
      expect(element.isolateScope().tagged.updating).toBe(true);
      deferred.resolve();
      $scope.$apply()
      expect(locationFactory.update).toHaveBeenCalled();
      expect(element.isolateScope().myForm.$pristine).toBe(true)
      expect(element.isolateScope().myForm.$dirty).toBe(false)
      expect(element.isolateScope().tagged.updating).toBe(undefined);
      expect(element.isolateScope().tagged.updated).toBe(true);
    });

    it("should NOT update the location when tagged logins is clicked", function() {
      spyOn(locationFactory, 'update').andCallThrough();
      element.isolateScope().splash = { tagged_logins: true };
      element.isolateScope().updateLocation();
      expect(element.isolateScope().tagged.updating).toBe(true);
      deferred.reject();
      $scope.$apply();
      expect(locationFactory.update).toHaveBeenCalled();
      expect(element.isolateScope().tagged.updating).toBe(undefined);
      expect(element.isolateScope().tagged.errors).toBe(true);
    });

    it("should update the splash page", function() {
      element.isolateScope().available_start = new Date();
      element.isolateScope().available_end = new Date();
      element.isolateScope().splash = { available_start: '0000', available_end: '13:54', splash_page_name: 'lobby'};
      spyOn(splashFactory, 'update').andCallThrough();
      var form = {
        $setPristine: function() {
        }
      };
      element.isolateScope().update(form);
      expect(element.isolateScope().splash.state).toBe('updating');
      deferred.resolve();
      $scope.$apply();
      expect(splashFactory.update).toHaveBeenCalled();
      expect(element.isolateScope().splash.state).toBe('updated');
      expect(element.isolateScope().notifications).toBe('Splash Updated Successfully.');
    });

    it("should uncheck the require email if newsletter is off", function() {
      element.isolateScope().splash = {newsletter_active: false, email_required: true};
      element.isolateScope().updateRequireEmail();
      expect(element.isolateScope().splash.email_required).toBe(false);
    });

    it("should not update the splash page", function() {
      element.isolateScope().available_start = new Date()
      element.isolateScope().available_end = new Date()
      element.isolateScope().splash = { available_start: '0000', available_end: '13:54', splash_page_name: 'lobby'}
      spyOn(splashFactory, 'update').andCallThrough()
      element.isolateScope().update();
      expect(element.isolateScope().splash.state).toBe('updating');
      deferred.reject({data: {errors: { base: [123]}}});
      $scope.$apply()
      expect(splashFactory.update).toHaveBeenCalled();
      expect(element.isolateScope().splash.state).toBe('failed');
      expect(element.isolateScope().myForm.errors).toBe(true);
    });
  });

  describe('splash_pages password change days', function () {

    var routeParams = {};

    beforeEach(inject(function($compile, $rootScope, $q, $routeParams) {
      $scope = $rootScope;
      routeParams = $routeParams;
      routeParams.id = "slugit";
      q = $q;
      $scope.location = { slug: 456, id: 123 };
      $scope.splash = {};
      $scope.splash.passwd_change_day = ["1","2","3"];
      $scope.splash.userdays = [];
      element = angular.element('<day-selector days="splash.passwd_change_day" array="splash.userdays"></day-selector>');
      $compile(element)($rootScope)
      element.scope().$apply();
    }))

    it("should loop through and create an checkboxes for days", function() {
      expect(JSON.stringify($scope.splash.userdays)).toBe(JSON.stringify([0,1,1,1,0,0,0]))
    });

    it("should update the user days passwd change array", function() {
      expect(JSON.stringify($scope.splash.passwd_change_day)).toBe(JSON.stringify([ '1', '2', '3' ]))
      element.find("#day_0").click()
      expect(JSON.stringify($scope.splash.passwd_change_day)).toBe(JSON.stringify([ '1', '2', '3', '0' ]))
      element.find("#day_1").click()
      expect(JSON.stringify($scope.splash.passwd_change_day)).toBe(JSON.stringify([ '2', '3', '0' ]))
    })

  });

  describe('splash_pages attr', function () {

    var routeParams = {};

    beforeEach(inject(function($compile, $rootScope, $q, $routeParams) {
      $scope = $rootScope;
      $scope.box = {};
      routeParams = $routeParams;
      routeParams.id = "slugit";
      q = $q;
      $scope.location = { slug: 456, id: 123 }
      $scope.splash = {};
      element = angular.element('<remove-image attribute=\'splash.location_image_name\' temp=\'splash.location_image_name_temp\'></remove-image>');
      $compile(element)($rootScope)
      element.scope().$apply();
    }))

    it("it should remove and undo the location image", function() {
      // expect(element.html()).toBe('<p class="remove-image"><small><a ng-show="attribute" class="remove-image ng-hide" ng-click="removeImage()">Remove Image</a></small></p><p class="remove-image"><small><a ng-show="temp" class="undo-remove ng-hide" ng-click="undoRemoveImage()">Undo</a></small></p>')
      expect(element.find('.remove-image').hasClass('ng-hide')).toBe(true);
      expect(element.find('.undo-remove').hasClass('ng-hide')).toBe(true);

      // Now with an image //
      $scope.splash.location_image_name = 123
      $scope.$apply();
      expect(element.find('.remove-image').hasClass('ng-hide')).toBe(false);
      expect(element.find('.undo-remove').hasClass('ng-hide')).toBe(true);

      // Click to remove //
      element.find('.remove-image').click();
      expect($scope.splash.location_image_name).toBe('')
      expect($scope.splash.location_image_name_temp).toBe(123)
      expect(element.find('.remove-image').hasClass('ng-hide')).toBe(true);
      expect(element.find('.undo-remove').hasClass('ng-hide')).toBe(false);

      // Undo //
      element.find('.undo-remove').click();
      expect($scope.splash.location_image_name).toBe(123)
      expect($scope.splash.location_image_name_temp).toBe(undefined)
      expect(element.find('.remove-image').hasClass('ng-hide')).toBe(false);
      expect(element.find('.undo-remove').hasClass('ng-hide')).toBe(true);
    });

  });

  describe('splash_pages desingers', function () {

    var routeParams = {};

    beforeEach(inject(function($compile, $rootScope, $q, $routeParams, $injector) {

      $httpBackend = $injector.get('$httpBackend');
      $httpBackend.whenGET('template/tooltip/tooltip-popup.html').respond("");

      $httpBackend.when('PATCH', 'http://mywifi.dev:8080/api/v1/locations/undefined/splash_pages/undefined')
      .respond(200, {});

      $scope = $rootScope;
      routeParams = $routeParams;
      routeParams.id = "slugit";
      q = $q;
      $scope.location = { slug: 456, id: 123 };
      $scope.splash = {};
      element = angular.element('<splash-designer></splash-designer>');
      $compile(element)($rootScope);
      element.scope().$apply();
    }))

    it("it should get the location and splash page", function() {
      spyOn(locationFactory, 'get').andCallThrough()
      expect(element.isolateScope().loading).toBe(true)

      var location = { location_name: 'simon' }
      deferred.resolve(location);
      $scope.$apply()
      expect(element.isolateScope().location).toBe(location)

      var splash = { splash_page: { logo: 'simon', header_image_name: null, logo_file_name: null } }
      deferred.resolve(splash);
      $scope.$apply()
      expect(element.isolateScope().splash).toBe(splash.splash_page)
      expect(element.isolateScope().loading).toBe(undefined)
      expect(element.isolateScope().uploadLogo).toBe(true);
    });

    it("it should set the image to a blank PNG", function() {
      element.isolateScope().splash = {};
      element.isolateScope().nologo = true;
      element.isolateScope().setTrans();
      expect(element.isolateScope().splash.header_image_name).toBe('https://d3e9l1phmgx8f2.cloudfront.net/images/login_screens/transparent.png');
    });

    it("it should save and continue", function() {
      spyOn(splashFormFactory, 'update').andCallThrough()
      element.isolateScope().splash = {};
      element.isolateScope().uploadLogo = true;
      element.isolateScope().saveAndContinue();
      expect(element.isolateScope().splash.updating).toBe(true);

      deferred.resolve({password: 123});
      $scope.$apply()
      // expect(element.isolateScope().uploadLogo).toBe(undefined);
    });

    it("it should have an image and then design the rest", function() {
    });

  });

  describe('splash_pages access types panels', function () {

    beforeEach(inject(function($compile, $rootScope, $q, $routeParams) {
      $scope = $rootScope;
      q = $q;
      $scope.splash = {}
      $scope.splash.password = "simon"
      element = angular.element('<div access-types ver=\'{{access_name(1)}}\'></div>');
      $compile(element)($rootScope)
      element.scope().$apply();
    }))

    it("should add a page to the erm, page", function() {
      $scope.$apply()
      expect(element.html() === undefined).toBe(false)
      // stupid test //
    });

  });

  describe('splash_pages password generation', function () {

    beforeEach(inject(function($compile, $rootScope, $q, $routeParams) {
      $scope = $rootScope;
      q = $q;
      $scope.splash = {}
      $scope.myForm = {};
      $scope.splash.password = "simon"
      $scope.generating = undefined;
      element = angular.element('<splash-generate-passy attribute="splash.password" loading=\'generating\'></splash-generate-passy>');
      $compile(element)($rootScope)
      element.scope().$apply();
    }))

    it("should call CT and generate a new passy", function() {
      $scope.myForm.$pristine = true;
      spyOn(codeFactory, 'generate_password').andCallThrough()
      expect(element.html() == undefined).toBe(false);
      element.find('a').click()
      expect($scope.generating).toBe(true)
      deferred.resolve({password: 123});
      $scope.$apply()
      expect(codeFactory.generate_password).toHaveBeenCalled();
      expect($scope.splash.password).toBe(123)
      expect($scope.generating).toBe(undefined)
      // expect($scope.myForm.$pristine).toBe(false);
    });

    it("should not call CT and generate a new passy", function() {
      spyOn(codeFactory, 'generate_password').andCallThrough()
      element.find('a').click()
      expect($scope.generating).toBe(true)
      deferred.reject();
      $scope.$apply()
      expect(codeFactory.generate_password).toHaveBeenCalled();
      expect($scope.splash.password).toBe('simon')
      expect($scope.generating).toBe(undefined)
    });

  });

  describe('splash_pages new', function () {

    beforeEach(inject(function($compile, $rootScope, $q, $routeParams, _$location_, _$routeParams_) {
      $location = _$location_;
      $routeParams = _$routeParams_
      $routeParams.location_id = 123
      $scope = $rootScope;
      q = $q;
      $scope.location = {slug: 123}
      element = angular.element('<splash-new><splash-new>');
      $compile(element)($rootScope)
      element.scope().$apply();
    }))

    it("should get a list of networks", function() {
      $scope.loading = true;
      spyOn(networkFactory, 'get').andCallThrough()
      expect(element.html() == undefined).toBe(false);
      var network = { id: 123 }
      var splash = { access_types: [{name: 'password', id: 888} ]}
      deferred.resolve([network]);
      $scope.$apply()
      expect(element.isolateScope().networks[0]).toBe(network);
      expect(element.isolateScope().splash.network_id).toBe(123)
      deferred.resolve(splash);
      $scope.$apply()
      expect(element.isolateScope().access_types).toBe(splash.access_types)
      expect(element.isolateScope().splash.primary_access_id).toBe(888)
      expect(element.isolateScope().loading).toBe(undefined)
      expect(element.isolateScope().splash == undefined).toBe(false)
    });

    it("should create the fuck out of the splash", function() {
      $scope.loading = true;
      spyOn(networkFactory, 'get').andCallThrough()
      spyOn(splashFactory, 'create').andCallThrough()
      element.isolateScope().create()
      expect(element.isolateScope().splash.creating).toBe(true);
      var splash = { id: 123}
      deferred.resolve(splash);
      $scope.$apply()
      // expect(element.isolateScope().splash.id).toBe(123)
      expect(element.isolateScope().notifications).toBe('Splash Created Successfully.')
      expect($location.path()).toBe('/locations/123/splash_pages/123')
    });

    it("should not create the fuck out of the splash", function() {
      element.isolateScope().loading = true;
      spyOn(networkFactory, 'get').andCallThrough()
      spyOn(splashFactory, 'create').andCallThrough()
      element.isolateScope().create()
      deferred.reject({data: {errors: { base: [123]}}});
      $scope.$apply()
      expect(element.isolateScope().splash.errors[0]).toBe(123)
      expect(element.isolateScope().splash.creating).toBe(undefined);
    });

  });

  describe('splash_pages delete!', function () {

    var routeParams = {};

    beforeEach(inject(function($compile, $rootScope, $q, $routeParams, _$location_) {
      $location = _$location_;
      $scope = $rootScope;
      $scope.box = {};
      routeParams = $routeParams;
      routeParams.id = "slugit";
      q = $q;
      $scope.splash = {unique_id: 123123}
      $scope.myForm = {};

      $scope.location = { slug: 456, id: 123 }
      element = angular.element('<splash-delete slug="{{location.slug}}"></splash-delete>');
      $compile(element)($rootScope)
      element.scope().$apply();
    }))

    it("should go abouts deleting the splash pages", function() {
      spyOn(splashFactory, 'destroy').andCallThrough()
      expect(element.find('#delete-splash').hasClass('ng-hide')).toBe(true);
      element.find('#delete-splash-confirm').click();
      $scope.$apply();
      expect(element.isolateScope().splash.deleting).toBe(true)
      expect(element.find('#delete-splash').hasClass('ng-hide')).toBe(false);
      expect(element.find('#delete-button').hasClass('ng-hide')).toBe(true);
      element.isolateScope().confirmation = 'danger'
      $scope.$apply();
      expect(element.find('#delete-button').hasClass('ng-hide')).toBe(false);
      element.find('#delete-button').click()
      deferred.resolve();
      $scope.$apply();
      expect($location.path()).toBe('/locations/456/splash_pages')
      expect(element.isolateScope().notifications).toBe('Splash Deleted Successfully.')
    });

  });

  describe('splash_pages duplication', function () {

    beforeEach(inject(function($compile, $rootScope, $q, $routeParams, _$location_) {
      $scope = $rootScope;
      $location = _$location_
      q = $q;
      $scope.splash = {unique_id: 567}
      $scope.location = {}
      $scope.location.slug = 12312783
      element = angular.element('<splash-duplicate unique_id=\'splash.unique_id\' slug=\'{{ location.slug }}\'></splash-duplicate>');
      $compile(element)($rootScope)
      element.scope().$apply();
    }))

    it("should copy a splash page to NO location, same.", function() {
      spyOn(splashFactory, 'duplicate').andCallThrough()
      expect(element.find('#duplicate').hasClass('ng-hide')).toBe(true);

      element.isolateScope().duplicate = true;
      $scope.$apply()
      expect(element.find('#duplicate').hasClass('ng-hide')).toBe(false);

      var cont = element.find('input[name*="copy_to"]').controller('ngModel');
      cont.$setViewValue(123);

      $scope.$apply()
      expect(element.isolateScope().copy_to).toBe(123)

      element.isolateScope().duplicateSplash();
      $scope.$apply()
      expect(element.isolateScope().duplicating).toBe(true)

      deferred.resolve({unique_id: 777});
      $scope.$apply()

      expect(element.isolateScope().duplicating).toBe(undefined)
      expect($location.path()).toBe('/locations/12312783/splash_pages')
      expect($location.search().new).toBe('777')
    });

    it("should not copy a splash page.", function() {
      spyOn(splashFactory, 'duplicate').andCallThrough()
      expect(element.find('#duplicate').hasClass('ng-hide')).toBe(true);

      element.isolateScope().duplicateSplash();

      deferred.reject({data: {errors: { base: [123]}}});
      $scope.$apply()
      expect(splashFactory.duplicate).toHaveBeenCalled();
      expect(element.isolateScope().duplicating).toBe(undefined)
      expect(element.isolateScope().errors[0]).toBe(123)
    });

  });

  describe('splash_pages store create', function () {

    beforeEach(inject(function($compile, $rootScope, $q, $routeParams) {
      $scope = $rootScope;
      routeParams = $routeParams;
      routeParams.new = "88888";
      $scope.box = {};
      q = $q;
      $scope.location = { slug: 456, id: 123 }
      // $scope.store = {}
      element = angular.element('<splash-store store="store"><create-store store="store"></create-store></splash-store>');
      $compile(element)($rootScope)
      element.scope().$apply();
    }))

  })

  describe('splash_pages store get', function () {

    beforeEach(inject(function($compile, $rootScope, $q, $routeParams, $injector) {
      $httpBackend = $injector.get('$httpBackend');
      $httpBackend.whenGET('components/splash_pages/view-store.html').respond("");

      $scope = $rootScope;
      routeParams = $routeParams;
      routeParams.new = "88888";
      $scope.box = {};
      q = $q;
      $scope.location = { slug: 456, id: 123 }
      $scope.store = {};
      element = angular.element('<splash-store store="store"></splash-store>');
      $compile(element)($rootScope)
      element.scope().$apply();
    }))

    it("should list a splash pages products", function() {
      var store = { store: { id: 123 }}
      var product = {
        duration: 60,
        type: 'multiuse',
        distance: 'minutes',
        download_speed: '2048',
        upload_speed: '1024',
        dummy: true,
        value: 300
      };
      spyOn(splashFactory, 'store').andCallThrough()
      deferred.resolve(store);
      $scope.$digest()
      expect($scope.store).toBe(store.store)
      expect(element.isolateScope().products[0].value).toBe(product.value)
    });


    it("should add another row to the products and then save!", function() {
      spyOn(window, 'confirm').andReturn(true);
      var store = { store: { id: 123 }}
      var product = {
        duration: 60,
        session_timeout: 60,
        type: 'multiuse',
        distance: 'minutes',
        download_speed: '2048',
        upload_speed: '1024',
        dummy: true,
        value: 300
      };
      spyOn(splashFactory, 'store').andCallThrough()
      deferred.resolve(store);
      $scope.$digest()
      expect($scope.store).toBe(store.store)
      expect(element.isolateScope().products.length).toBe(1)

      element.isolateScope().addProduct()
      $scope.$digest()
      expect(element.isolateScope().template).toBe(true)
      expect(element.isolateScope().adding).toBe(true)
      expect(element.isolateScope().product.value).toBe(product.value)
      expect(element.isolateScope().product.type).toBe("multiuse")
      expect(element.isolateScope().product.duration).toBe(60)
      expect(element.isolateScope().product.session_timeout).toBe(60)

      element.isolateScope().saveProduct()
      $scope.$digest()
      expect(element.isolateScope().products.length).toBe(2)
      expect(element.isolateScope().updating).toBe(true)

      // Submits to CT //
      deferred.resolve(store);
      $scope.$digest()
      expect(element.isolateScope().updating).toBe(undefined)
      expect(element.isolateScope().product).toBe(undefined)
    });

    it("should remove a row from the products", function() {
      spyOn(window, 'confirm').andReturn(true);
      var store = { store: { id: 123 }}
      var product = {
        duration: 60,
        type: 'multiuse',
        distance: 'minutes',
        download_speed: '2048',
        upload_speed: '1024',
        dummy: true,
        value: 300
      };
      spyOn(splashFactory, 'store').andCallThrough()
      deferred.resolve(store);
      $scope.$digest()
      expect($scope.store).toBe(store.store)
      expect(element.isolateScope().products.length).toBe(1)

      element.isolateScope().addProduct()
      $scope.$apply()
      // expect($location.hash()).toBe('new')
      expect(element.isolateScope().adding).toBe(true)
      expect(element.isolateScope().product.value).toBe(product.value)

      element.isolateScope().saveProduct()
      $scope.$digest()
      expect(element.isolateScope().products.length).toBe(2)
      expect(element.isolateScope().updating).toBe(true)

      element.isolateScope().removeProduct(0)
      $scope.$digest()
      expect(element.isolateScope().products[0]._destroy).toBe(1)
      expect(element.isolateScope().changed).toBe(true);
    });

    it("should update the store accordingly", function() {
      spyOn(window, 'confirm').andReturn(true);
      spyOn(splashFactory, 'update_store').andCallThrough()
      element.isolateScope().update()
      $scope.$digest()
      expect(element.isolateScope().updating).toBe(true)
      deferred.resolve();
      $scope.$digest()
      expect(element.isolateScope().updating).toBe(undefined)
    });

    it("should NOT update the store accordingly", function() {
      spyOn(splashFactory, 'update_store').andCallThrough()
      element.isolateScope().update()
      $scope.$digest()
      expect(element.isolateScope().updating).toBe(true)
      deferred.reject(123);
      $scope.$digest()
      expect(element.isolateScope().updating).toBe(undefined)
      expect(element.isolateScope().store.errors).toBe(123)
    });

    it("should create a new store", function() {
      spyOn(window, 'confirm').andReturn(true);
      spyOn(splashFactory, 'create_store').andCallThrough()
      var store = { store: { id: 123, created_at: 123 }}
      deferred.resolve();
      $scope.$digest()

      element.find('#create-store').click()
      $scope.$digest()

      expect(element.isolateScope().creating).toBe(true)

      deferred.resolve(store);
      $scope.$digest()
      expect(element.isolateScope().creating).toBe(undefined)
      expect($scope.store).toBe(store)
    });

    it("should NOT create a new store", function() {
      spyOn(splashFactory, 'create_store').andCallThrough()
      var store = { store: { id: 123 }}
      deferred.resolve();
      $scope.$digest()

      element.find('#create-store').click()
      $scope.$digest()

      expect(element.isolateScope().creating).toBe(true)

      deferred.reject(123);
      $scope.$digest()
      expect(element.isolateScope().creating).toBe(undefined)
      expect($scope.store.errors).toBe(123)
    });

    it("should set the store as active and update CT", function() {
      spyOn(window, 'confirm').andReturn(true);
      spyOn(splashFactory, 'update_store').andCallThrough()
      var store = { store: { id: 123, active: false }}
      $scope.store = store.store
      element.isolateScope().updateLiveStatus();
      $scope.$apply();
      expect(element.isolateScope().updating).toBe(true)
      deferred.resolve();
      $scope.$digest()

      expect(element.isolateScope().updating).toBe(undefined)
    })

    it("should start editing and add hash to path", function() {
      spyOn(window, 'confirm').andReturn(true);
      element.isolateScope().updateLiveStatus();
      $scope.$apply();
    })

  });

  describe('displays the days active on index page', function () {

    beforeEach(inject(function($compile, $rootScope, $q, $routeParams, $injector) {
      compile = $compile;
      $scope = $rootScope;
      q = $q;
      $scope.location = { slug: 456, id: 123 }
      element = angular.element('<splash-days-active start="{{splash.available_start}}" end="{{ splash.available_end }}" days="splash.available_days"></splash-days-active>');
    }))

    it("should show Monday all day ", function() {
      $scope.splash = { available_days: [1], available_start: '00:00', available_end: '00:00' }
      compile(element)($scope)
      element.scope().$apply();
      expect(element.isolateScope().days).toBe('Monday')
      expect(element.isolateScope().when).toBe('all day ')
    });

    it("should show Monday and Tuesday all day ", function() {
      $scope.splash = { available_days: [1, 2], available_start: '00:00', available_end: '00:00' }
      compile(element)($scope)
      element.scope().$apply();
      expect(element.isolateScope().days).toBe('Monday and Tuesday')
      expect(element.isolateScope().when).toBe('all day ')
    });

    it("should show Monday Tuesday Wed all day ", function() {
      $scope.splash = { available_days: [1, 2, 3], available_start: '00:00', available_end: '00:00' }
      compile(element)($scope)
      element.scope().$apply();
      expect(element.isolateScope().days).toBe('Monday, Tuesday, Wednesday')
      expect(element.isolateScope().when).toBe('all day ')
    });

    it("should show no days ", function() {
      $scope.splash = { available_days: [], available_start: '00:00', available_end: '00:00' }
      compile(element)($scope)
      element.scope().$apply();
      expect(element.isolateScope().days).toBe('No days selected')
      expect(element.isolateScope().when).toBe(undefined)
    });
  });


})
