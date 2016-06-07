'use strict';

describe('lists location products', function () {

  var $scope;
  var element;
  var $location;
  var $cookies;
  var productFactory;
  var cartFactory;
  var $routeParams;
  var splashFactory;
  var q;
  var deferred;
  var $httpBackend;

  beforeEach(module('myApp', function($provide) {
    productFactory = {
      query: function () {
        deferred = q.defer();
        return {$promise: deferred.promise};
      }
    };
    cartFactory = {
      get: function () {
        deferred = q.defer();
        return {$promise: deferred.promise};
      },
      update: function () {
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
      }
    };
    $provide.value("Product", productFactory);
    $provide.value("Cart", cartFactory);
  }));

  beforeEach(module('components/shop/_index.html'));
  beforeEach(module('components/shop/_cart.html'));

  describe('getting the products for the shop', function() {

    beforeEach(inject(function($compile, $rootScope, $q, _$location_, $injector, _$cookies_) {
      $scope = $rootScope;
      $location = _$location_;
      q = $q;
      $scope.voucher = {
        unique_id: 123
      };
      $cookies = _$cookies_
      $cookies.ctCartId = 'AngularJs';
      element = angular.element('<shopping-cart><display-shop-products><display-shop-products></shopping-cart>');
      $compile(element)($rootScope)
      element.scope().$apply();
    }));

    it("should display the products", function() {
      spyOn(productFactory, 'query').andCallThrough()
      var shopScope = element.find('display-shop-products').isolateScope()
      expect(shopScope.loading).toBe(true)

      var products = [{ username: 'simons' }];
      deferred.resolve(products);
      $scope.$apply()

      expect(shopScope.products.length).toBe(1);
      // expect(shopScope.loading).toBe(undefined)
    });

    it("should get a cart as we have a cookie set", function() {
      spyOn(productFactory, 'query').andCallThrough()
      spyOn(cartFactory, 'get').andCallThrough()
      var shopScope = element.find('display-shop-products').isolateScope()

      var products = [{ username: 'simons' }]
      deferred.resolve(products);
      $scope.$apply()

      shopScope.getCart()
      var cart = {cart: { username: 'simons' }, line_items: {} }
      deferred.resolve(cart);
      $scope.$apply()

      expect(shopScope.cart).toBe(cart);
    });

    it("should get a cart but rec. a 422 and wipe the cookies", function() {
      $cookies.put('ctCartId', 123)
      spyOn(productFactory, 'query').andCallThrough();
      spyOn(cartFactory, 'get').andCallThrough();
      var shopScope = element.find('display-shop-products').isolateScope()

      var products = [{ username: 'simons' }];
      deferred.resolve(products);
      $scope.$apply();

      shopScope.getCart();
      var cart = {cart: { username: 'simons' }, line_items: {} };
      deferred.reject();
      $scope.$apply();

      expect($cookies.get('ctCartId')).toBe(undefined);
    });

    it("should create a cart as we have no cookie set", function() {
      spyOn(productFactory, 'query').andCallThrough();
      spyOn(cartFactory, 'get').andCallThrough();
      spyOn(cartFactory, 'create').andCallThrough();
      var shopScope = element.find('display-shop-products').isolateScope();

      var products = [{ username: 'simons' }];
      deferred.resolve(products);
      $scope.$apply();

      shopScope.addToCart(products[0]);
      expect(shopScope.products[0].state).toBe('adding');
      var cart = {cart: { username: 'simons' }, line_items: {} }
      deferred.resolve(cart);
      $scope.$apply()

      expect(shopScope.cart).toBe(cart);
      expect(shopScope.products[0].state).toBe('added');
    });

    it("should not create and or add because of an error", function() {
      spyOn(productFactory, 'query').andCallThrough();
      spyOn(cartFactory, 'get').andCallThrough();
      spyOn(cartFactory, 'create').andCallThrough();
      var shopScope = element.find('display-shop-products').isolateScope();

      var products = [{ username: 'simons' }];
      deferred.resolve(products);
      $scope.$apply();

      shopScope.addToCart(products[0]);
      expect(shopScope.products[0].state).toBe('adding');
      deferred.reject();
      $scope.$apply();

      expect(shopScope.products[0].state).toBe('failed');
    });

    it("should get a cart and mark the products on display in the cart", function() {
      spyOn(productFactory, 'query').andCallThrough()
      spyOn(cartFactory, 'get').andCallThrough()
      var shopScope = element.find('display-shop-products').isolateScope()

      var products = [{ id: 1 }, { id: 2 }]
      deferred.resolve(products);
      $scope.$apply()

      shopScope.getCart()
      var cart = {cart: { id: 1 }, line_items: [{product_id: 1}] }
      deferred.resolve(cart);
      $scope.$apply()

      expect(shopScope.cart).toBe(cart);

      expect(products[0].state).toBe('added');
    });

    it("should delete the cart", function() {
      spyOn(productFactory, 'query').andCallThrough()
      spyOn(cartFactory, 'get').andCallThrough()
      var shopScope = element.find('display-shop-products').isolateScope()

      var products = [{ id: 1 }, { id: 2 }]
      deferred.resolve(products);
      $scope.$apply()

      shopScope.getCart()
      var cart = {cart: { id: 1 }, line_items: [{product_id: 1}] }
      deferred.resolve(cart);
      $scope.$apply()

      expect(shopScope.cart).toBe(cart);

      $cookies.put('ctCartId', 123)
      shopScope.emptyCart();
      deferred.resolve();
      $scope.$apply()
      expect(shopScope.cart).toBe(undefined);
    });

  });

  describe('displaying the cart', function() {

    beforeEach(inject(function($compile, $rootScope, $q, _$location_, $injector, _$cookies_) {
      $scope = $rootScope;
      $location = _$location_;
      q = $q;
      $cookies = _$cookies_
      element = angular.element('<shopping-cart><display-shop-cart><display-shop-cart></shopping-cart>');
      $compile(element)($rootScope)
      element.scope().$apply();
    }));

    it("should display the cart", function() {
      spyOn(cartFactory, 'get').andCallThrough()
      var shopScope = element.find('display-shop-cart').isolateScope()
      expect(shopScope.loading).toBe(true)

      var cart = {cart: { id: 1 }, line_items: [{product_id: 1}] }
      deferred.resolve(cart);
      $scope.$apply()

      expect(shopScope.cart).toBe(cart.cart);
      expect(shopScope.line_items).toBe(cart.line_items);
    });

    it("should redirect to shop as no cart", function() {
      spyOn(cartFactory, 'get').andCallThrough()
      var shopScope = element.find('display-shop-cart').isolateScope()
      expect(shopScope.loading).toBe(true)

      deferred.reject();
      $scope.$apply()

      expect($location.path()).toBe('/shop')
    });

    it("should remove a product from the cart", function() {
      spyOn(cartFactory, 'get').andCallThrough()
      var shopScope = element.find('display-shop-cart').isolateScope()
      expect(shopScope.loading).toBe(true)

      var cart = {cart: { id: 1 }, line_items: [{product_id: 1}] }
      var cart2 = {cart: { id: 1 }, line_items: [] }
      deferred.resolve(cart);
      $scope.$apply()

      expect(shopScope.cart).toBe(cart.cart);
      expect(shopScope.line_items).toBe(cart.line_items);

      shopScope.removeProduct(0)
      expect(cart.line_items[0].state).toBe('removing');
      expect(cart.line_items[0].quantity).toBe(0);

      deferred.resolve(cart2);
      $scope.$apply()

      expect(shopScope.line_items.length).toBe(0);
    });

    it("should update a product qnty in the cart", function() {
      spyOn(cartFactory, 'get').andCallThrough()
      var shopScope = element.find('display-shop-cart').isolateScope()
      expect(shopScope.loading).toBe(true)

      var cart = {cart: { id: 1 }, line_items: [{product_id: 1, quantity: 1}] }
      deferred.resolve(cart);
      $scope.$apply()

      expect(shopScope.cart).toBe(cart.cart);

      shopScope.updateProduct(0,1)
      expect(cart.line_items[0].quantity).toBe(2);

      deferred.resolve(cart);
      $scope.$apply()

      expect(cart.line_items.length).toBe(1);
    });

    it("should update the address details", function() {
      spyOn(cartFactory, 'get').andCallThrough()
      var shopScope = element.find('display-shop-cart').isolateScope()
      expect(shopScope.loading).toBe(true)

      var cart = {cart: { id: 1 }, line_items: [{product_id: 1, quantity: 1}], user: {type: "Visa", last4: "1234", existing_card: true} }
      deferred.resolve(cart);
      $scope.$apply()

      expect(shopScope.cart).toBe(cart.cart);
      expect(shopScope.user.credit_card_last4).toBe("1234");
      expect(shopScope.user.existing_card).toBe(true);
      expect(shopScope.user.credit_card_type).toBe("Visa");
      expect(shopScope.cart.useExisting).toBe(true);

      shopScope.updateOrder()
      expect(shopScope.saving).toBe(true)

      deferred.resolve(cart);
      $scope.$apply()

      expect(shopScope.saving).toBe(undefined)
    });

    it("should process the payment and return queue state", function() {
      spyOn(cartFactory, 'update').andCallThrough()
      var shopScope = element.find('display-shop-cart').isolateScope()

      var cart = {cart: { id: 1, state: 'queued' }, line_items: [{product_id: 1, quantity: 1}] }
      shopScope.cart = cart.cart;
      var result = {id: 123456}
      shopScope.stripeCallback(123,result)
      expect(shopScope.paying).toBe(true)

      deferred.resolve(cart);
      $scope.$apply()

      expect(shopScope.cart).toBe(cart.cart);
      expect(shopScope.paying).toBe(undefined)
    });

    it("should not process the payment - 422 from strip", function() {
      spyOn(cartFactory, 'update').andCallThrough()
      var shopScope = element.find('display-shop-cart').isolateScope()

      var cart = {cart: { id: 1 }, line_items: [{product_id: 1, quantity: 1}] }
      shopScope.cart = cart.cart;
      var result = {id: 123456, error: {message: 'error'} }
      shopScope.stripeCallback(123,result)

      expect(shopScope.errors).toBe('error')
      expect(shopScope.paying).toBe(undefined)
    });
  });

  describe('displaying finalised path', function() {

    beforeEach(inject(function($compile, $rootScope, $q, _$location_, $injector, _$cookies_, _$routeParams_) {
      $scope = $rootScope;
      $routeParams = _$routeParams_;
      $routeParams.msg = 'processing'
      $location = _$location_;
      q = $q;
      $cookies = _$cookies_
      element = angular.element('<shopping-finalised></shopping-finalised>');
      $compile(element)($rootScope)
      element.scope().$apply();
    }));

    it("should a message to say thanks for the order", function() {
      expect(element.isolateScope().state).toBe('processing');
    });

  });

});

