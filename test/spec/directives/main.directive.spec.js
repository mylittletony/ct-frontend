'use strict';

describe('loader', function () {

  var $scope;
  var element;

  beforeEach(module('myApp'));

  beforeEach(inject(function($compile, $rootScope) {
    $scope = $rootScope;
    element = angular.element("<div loader></div>");
    $compile(element)($rootScope)
  }))

  it("should add a link to the advanced settings", function() {
    // expect(element.html()).toBe('<div id="circleG"><div id="circleG_1" class="circleG"></div><div id="circleG_2" class="circleG"></div><div id="circleG_3" class="circleG"></div></div>');
  });

});

describe('navbar', function () {

  var $scope;
  var element;
  var $httpBackend;
  var location = {};

  beforeEach(module('myApp'));

  beforeEach(module('components/navbar/navbar.html'));

  beforeEach(inject(function($compile, $rootScope,$injector,$location) {
    $httpBackend = $injector.get('$httpBackend');
    $httpBackend.when('GET', 'template/topbar/toggle-top-bar.html')
      .respond(200);
    $httpBackend.when('GET', 'template/topbar/top-bar-dropdown.html')
      .respond(200);
    $httpBackend.when('GET', 'template/topbar/has-dropdown.html')
      .respond(200);
    $httpBackend.when('GET', 'template/topbar/top-bar-section.html')
      .respond(200);
    $httpBackend.when('GET', 'template/topbar/top-bar.html')
      .respond(200);


    $scope = $rootScope;
    element = angular.element("<navbar></navbar>");
    $compile(element)($rootScope)
    element.scope().$apply();
  }))

  it("should add a nav bar, mo fo", function() {
    var a = (element.html() == undefined)
    expect(a).toBe(false)
    expect(element.find('#navbar').hasClass('hidden')).toBe(false);

    // fucking cant stub the location to test the hash //
  });

});

describe('errors display', function () {

  var $scope;
  var element;

  beforeEach(module('myApp'));

  beforeEach(inject(function($compile, $rootScope) {
    $scope = $rootScope;
    element = angular.element("<div errors='errors'></div>");
    $compile(element)($rootScope)
  }))

  // it("should add an include to the page", function() {
  //   expect(element.html()).toBe('<!-- ngIf: errors -->');
  // });


  it("display some errors mother fucker", function() {
    $scope.errors = "123";
    $scope.$apply();
    expect(element.html()).toBe('<div ng-show="errors" class="alert-box alert"><!-- ngRepeat: (name, error) in errors --><ul class="list-unstyled ng-scope" ng-repeat="(name, error) in errors"><li class="ng-binding">0 1</li></ul><!-- end ngRepeat: (name, error) in errors --><ul class="list-unstyled ng-scope" ng-repeat="(name, error) in errors"><li class="ng-binding">1 2</li></ul><!-- end ngRepeat: (name, error) in errors --><ul class="list-unstyled ng-scope" ng-repeat="(name, error) in errors"><li class="ng-binding">2 3</li></ul><!-- end ngRepeat: (name, error) in errors --></div>');
  });

});

describe('filepicker picker', function () {

  var $scope;
  var element;

  beforeEach(module('myApp'));

  beforeEach(inject(function($compile, $rootScope) {
    $scope = $rootScope;
    element = angular.element("<filepicker></filepicker>");
    $compile(element)($rootScope)
  }))

  // Why is this so??? //
  it("should add an include to the page", function() {
    expect(element.html()).toBe('<p><a ng-click="upload()" class="button tiny" href="">Upload</a></p>');
  });

});

