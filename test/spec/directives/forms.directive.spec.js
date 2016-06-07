'use strict';

describe('forms creation, listing', function () {

  var $scope,
      element,
      deferred,
      q,
      $routeParams,
      location,
      locationFactory,
      $httpBackend,
      boxFactory,
      networkFactory,
      formFactory;

  beforeEach(module('myApp', function($provide) {
    formFactory = {
      destroy: function () {
        deferred = q.defer();
        return {$promise: deferred.promise};
      },
      update: function () {
        deferred = q.defer();
        return {$promise: deferred.promise};
      },
      query: function () {
        deferred = q.defer();
        return {$promise: deferred.promise};
      },
      get: function () {
        deferred = q.defer();
        return {$promise: deferred.promise};
      },
      create: function () {
        deferred = q.defer();
        return {$promise: deferred.promise};
      }
    };
    $provide.value("Form", formFactory);
  }));

  beforeEach(module('components/splash_pages/_form_designer.html'));
  describe('forms creation, listing', function () {

    beforeEach(inject(function($compile, $rootScope, $q, _$routeParams_, $injector) {
      $scope = $rootScope;
      q = $q;
      element = angular.element('<list-forms></list-forms>');
      $compile(element)($rootScope)
      element.scope().$digest();
    }));

    it("should list the forms for a location", function() {
      spyOn(formFactory, 'get').andCallThrough();
      var form = { form_name: 'lobby' };
      expect(element.isolateScope().loading).toBe(true)
      deferred.resolve(form);
      $scope.$digest();
      var types = { 'Email' : 'email', 'Password' : 'password', 'Text' :  'text', 'Checkbox' : 'checkbox', 'Text Area': 'textarea', 'Radio': 'radio', 'Dropdown': 'dropdown' };
      expect(JSON.stringify(element.isolateScope().types)).toBe(JSON.stringify(types));
      expect(element.isolateScope().loading).toBe(undefined);
      expect(element.isolateScope().form === undefined).toBe(false);
    });

    it("should build a form for location - none created yet", function() {
      spyOn(formFactory, 'get').andCallThrough();
      expect(element.isolateScope().loading).toBe(true)
      deferred.resolve();
      $scope.$digest()
      expect(element.isolateScope().loading).toBe(undefined);
      expect(element.isolateScope().form.message).toBe('This is my great registration form. Please enter your details to get online');
      expect(element.isolateScope().form.registration_fields[0].name).toBe('username');
      expect(element.isolateScope().form.registration_fields[0].required).toBe(true);
      expect(element.isolateScope().form.registration_fields[0].field_type).toBe('email');
      expect(element.isolateScope().form.registration_fields[0].hidden).toBe(false);
      expect(element.isolateScope().form.registration_fields[0].label).toBe('Enter your Email');
      expect(element.isolateScope().form.registration_fields[0].value).toBe('');
    });

    it("should create a form for a location", function() {
      spyOn(formFactory, 'get').andCallThrough();
      spyOn(formFactory, 'create').andCallThrough();
      var form = { forms: [ { form_name: 'lobby'} ], _info: {} };
      element.isolateScope().form = form;

      element.isolateScope().saveForm();
      deferred.resolve(form);
      $scope.$digest()
      expect(element.isolateScope().form.saved).toBe(true);
    })

    it("should fail to create a form for a location 422", function() {
      spyOn(formFactory, 'get').andCallThrough();
      spyOn(formFactory, 'create').andCallThrough();
      var form = { forms: [ { form_name: 'lobby'} ], _info: {} };
      element.isolateScope().form = form;
      element.isolateScope().form.saved = form;

      element.isolateScope().saveForm();
      deferred.reject(123);
      $scope.$digest()
      expect(element.isolateScope().form.saved).toBe(undefined);
      expect(element.isolateScope().form.errors).toBe(123);
    })

    it("should update a form for a location", function() {
      spyOn(formFactory, 'get').andCallThrough();
      spyOn(formFactory, 'create').andCallThrough();
      var field = { label: '123', name: 'anon' }
      var form = { id: '123123', registration_fields: [field]} ;
      element.isolateScope().form = form;

      element.isolateScope().saveForm();
      deferred.resolve(form);
      $scope.$digest()
      expect(element.isolateScope().form.saved).toBe(true);
    })

    it("should update a form for a location", function() {
      spyOn(formFactory, 'get').andCallThrough();
      spyOn(formFactory, 'create').andCallThrough();
      var field = { label: '123', name: 'anon' }
      var form = { id: '123123', registration_fields: [field]} ;
      element.isolateScope().form = form;

      element.isolateScope().addFields(field);
      expect(element.isolateScope().form.registration_fields_attributes.length).toBe(2);
    });

    it("should delete a field", function() {
      spyOn(window, 'confirm').andReturn(true);
      spyOn(formFactory, 'get').andCallThrough();
      spyOn(formFactory, 'create').andCallThrough();
      var field = { label: '123', name: 'anon', _id: "111" }
      var form = { id: '123123', registration_fields: [field]} ;
      element.isolateScope().form = form;

      element.isolateScope().deleteField("111");
      expect(element.isolateScope().form.registration_fields_attributes[0]._destroy).toBe(true);
    });

  });
});
