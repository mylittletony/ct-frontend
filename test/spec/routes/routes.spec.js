'use strict';

describe('Routing', function () {

  beforeEach(module('myApp'));

  it('should map routes to controllers', function() {

    inject(function($route) {

      expect($route.routes['/'].controller).toBe('HomeCtrl');
      expect($route.routes['/'].templateUrl).
                  toEqual('components/locations/index/index.html');

      expect($route.routes['/login'].templateUrl).
                  toEqual('components/home/hello.html');

      expect($route.routes['/apps'].templateUrl).
                  toEqual('components/apps/index.html');

      expect($route.routes['/apps/:id'].templateUrl).
                  toEqual('components/apps/show.html');

      expect($route.routes['/apps/:id/edit'].templateUrl).
                  toEqual('components/apps/new.html');

      expect($route.routes['/apps/new'].templateUrl).
                  toEqual('components/apps/new.html');

      expect($route.routes['/downloads'].templateUrl).
                  toEqual('components/downloads/index.html');

      expect($route.routes['/locations/map'].templateUrl).
                  toEqual('components/locations/map/index.html');

      expect($route.routes['/locations/new'].templateUrl).
                  toEqual('components/locations/new/index.html');

      expect($route.routes['/locations/:id'].controller).toBe('LocationsCtrl as lc');
      expect($route.routes['/locations/:id'].templateUrl).
                  toEqual('components/locations/show/index.html');

      expect($route.routes['/locations/:id/clients'].templateUrl).
                  toEqual('components/locations/clients/index.html');

      expect($route.routes['/locations/:id/clients/:client_id'].templateUrl).
                  toEqual('components/locations/clients/show.html');

      expect($route.routes['/locations/:id/clients/:client_id/codes'].templateUrl).
                  toEqual('components/locations/clients/codes.html');

      expect($route.routes['/locations/:id/clients/:client_id/social/:social_id'].templateUrl).
                  toEqual('components/locations/clients/social.html');

      expect($route.routes['/locations/:id/clients/:client_id/codes/:username'].templateUrl).
                  toEqual('components/locations/clients/show_code.html');

      expect($route.routes['/locations/:id/clients/:client_id/codes/:username/sessions'].templateUrl).
                  toEqual('components/locations/clients/sessions.html');

      expect($route.routes['/locations/:id/clients/:client_id/sessions'].templateUrl).
                  toEqual('components/locations/clients/sessions.html');

      expect($route.routes['/locations/:id/clients/:client_id/orders/:order_id'].templateUrl).
                  toEqual('components/locations/clients/show_order.html');

      expect($route.routes['/locations/:id/group_policies'].templateUrl).
                  toEqual('components/views/group_policies/index.html');

      expect($route.routes['/locations/:id/group_policies/:group_policy_id'].templateUrl).
                  toEqual('components/views/group_policies/show.html');

      expect($route.routes['/locations/:id/group_policies/:group_policy_id/clients'].templateUrl).
                  toEqual('components/views/group_policies/clients.html');

      expect($route.routes['/events'].templateUrl).
                  toEqual('components/events/index.html');

      expect($route.routes['/events/:id'].templateUrl).
                  toEqual('components/events/show.html');

      expect($route.routes['/locations/:id/triggers'].templateUrl).
                  toEqual('components/locations/triggers/index.html');

      expect($route.routes['/locations/:id/triggers/new'].templateUrl).
                  toEqual('components/locations/triggers/new.html');

      expect($route.routes['/locations/:id/triggers/:trigger_id'].templateUrl).
                  toEqual('components/locations/triggers/show.html');

      expect($route.routes['/locations/:id/triggers/:trigger_id/edit'].templateUrl).
                  toEqual('components/locations/triggers/edit.html');

      expect($route.routes['/locations/:id/triggers/:trigger_id/trigger_history'].templateUrl).
                  toEqual('components/locations/triggers/history/index.html');

      expect($route.routes['/locations/:id/triggers/:trigger_id/trigger_history/:trigger_history_id'].templateUrl).
                  toEqual('components/locations/triggers/history/show.html');

      expect($route.routes['/locations/:id/settings'].controller).toBe('LocationsCtrl as lc');
      expect($route.routes['/locations/:id/settings'].templateUrl).
                  toEqual('components/locations/settings/index.html');

      expect($route.routes['/locations/:id/settings/notifications'].controller).toBe('LocationsCtrl as lc');
      expect($route.routes['/locations/:id/settings/notifications'].templateUrl).
                  toEqual('components/locations/settings/notifications.html');

      expect($route.routes['/locations/:id/settings/devices'].controller).toBe('LocationsCtrl as lc');
      expect($route.routes['/locations/:id/settings/devices'].templateUrl).
                  toEqual('components/locations/settings/devices.html');

      expect($route.routes['/locations/:id/settings/splash'].controller).toBe('LocationsCtrl as lc');
      expect($route.routes['/locations/:id/settings/splash'].templateUrl).
                  toEqual('components/locations/settings/splash.html');

      expect($route.routes['/locations/:id/settings/analytics'].controller).toBe('LocationsCtrl as lc');
      expect($route.routes['/locations/:id/settings/analytics'].templateUrl).
                  toEqual('components/locations/settings/analytics.html');

      expect($route.routes['/locations/:id/networks'].templateUrl).
                  toEqual('components/locations/networks/index.html');

      expect($route.routes['/locations/:id/networks/:network_id'].templateUrl).
                  toEqual('components/locations/networks/show.html');

      expect($route.routes['/locations/:id/versions'].controller).toBe('LocationsCtrl as lc');
      expect($route.routes['/locations/:id/versions'].templateUrl).
                  toEqual('components/locations/versions/index.html');

      expect($route.routes['/locations/:id/zones'].templateUrl).
                  toEqual('components/zones/index.html');

      expect($route.routes['/locations/:id/zones/:zone_id'].controller).toBe('LocationsCtrl as lc');
      expect($route.routes['/locations/:id/zones/:zone_id'].templateUrl).
                  toEqual('components/zones/show.html');

      expect($route.routes['/locations/:id/vouchers'].controller).toBe('LocationsCtrl as lc');
      expect($route.routes['/locations/:id/vouchers'].templateUrl).
                  toEqual('components/vouchers/index.html');

      expect($route.routes['/locations/:id/vouchers/new'].controller).toBe('LocationsCtrl as lc');
      expect($route.routes['/locations/:id/vouchers/new'].templateUrl).
                  toEqual('components/vouchers/new.html');

      expect($route.routes['/locations/:id/vouchers/:voucher_id'].controller).toBe('LocationsCtrl as lc');
      expect($route.routes['/locations/:id/vouchers/:voucher_id'].templateUrl).
                  toEqual('components/vouchers/show.html');

      expect($route.routes['/locations/:id/vouchers/:voucher_id/codes'].controller).toBe('LocationsCtrl as lc');
      expect($route.routes['/locations/:id/vouchers/:voucher_id/codes'].templateUrl).
                  toEqual('components/codes/vouchers_index.html');

      expect($route.routes['/locations/:id/splash_codes'].templateUrl).
                  toEqual('components/splash_codes/index.html');

      expect($route.routes['/locations/:id/splash_codes/new'].templateUrl).
                  toEqual('components/splash_codes/new.html');

      expect($route.routes['/locations/:id/splash_codes/:splash_code_id'].templateUrl).
                  toEqual('components/splash_codes/show.html');

      expect($route.routes['/locations/:id/splash_pages'].templateUrl).
                  toEqual('components/splash_pages/index.html');

      expect($route.routes['/locations/:id/splash_pages/new'].controller).toBe('SplashPagesCtrlNew');
      expect($route.routes['/locations/:id/splash_pages/new'].templateUrl).
                  toEqual('components/splash_pages/new.html');

      expect($route.routes['/locations/:id/splash_pages/:splash_page_id'].controller).toBe('LocationsCtrl as lc');
      expect($route.routes['/locations/:id/splash_pages/:splash_page_id'].templateUrl).
                  toEqual('components/splash_pages/show.html');

      expect($route.routes['/locations/:id/splash_pages/:splash_page_id/design'].templateUrl).
                  toEqual('components/splash_pages/design.html');

      expect($route.routes['/locations/:id/splash_pages/:splash_page_id/store'].templateUrl).
                  toEqual('components/splash_pages/store.html');

      expect($route.routes['/locations/:id/devices/new'].templateUrl).
                  toEqual('components/boxes/new/index.html');

      expect($route.routes['/locations/:id/devices/:box_id'].controller).toBe('LocationsCtrl as lc');
      expect($route.routes['/locations/:id/devices/:box_id'].templateUrl).
                  toEqual('components/boxes/show/index.html');

      expect($route.routes['/locations/:id/devices/:box_id/edit'].controller).toBe('LocationsCtrl as lc');
      expect($route.routes['/locations/:id/devices/:box_id/edit'].templateUrl).
                  toEqual('components/boxes/edit/index.html');

      // expect($route.routes['/locations/:id/boxes/:box_id/port_forwards'].controller).toBe('PortForwardsCtrl');
      // expect($route.routes['/locations/:id/boxes/:box_id/port_forwards'].templateUrl).
      //             toEqual('components/boxes/port_forwards/index.html');

      expect($route.routes['/locations/:id/devices/:box_id/versions'].controller).toBe('LocationsCtrl as lc');
      expect($route.routes['/locations/:id/devices/:box_id/versions'].templateUrl).
                  toEqual('components/boxes/versions/index.html');

      expect($route.routes['/locations/:id/devices/:box_id/payloads'].controller).toBe('LocationsCtrl as lc');
      expect($route.routes['/locations/:id/devices/:box_id/payloads'].templateUrl).
                  toEqual('components/boxes/payloads/index.html');

      expect($route.routes['/register'].templateUrl).
                  toEqual('components/registrations/index.html');

      expect($route.routes['/users'].templateUrl).
                  toEqual('components/users/index/index.html');

      expect($route.routes['/me'].controller).toBe('UsersShowController');
      expect($route.routes['/me'].templateUrl).
                  toEqual('components/users/show/index.html');

      expect($route.routes['/users/:id'].controller).toBe('UsersShowController');
      expect($route.routes['/users/:id'].templateUrl).
                  toEqual('components/users/show/index.html');

      expect($route.routes['/users/:id/sessions'].templateUrl).
                  toEqual('components/users/sessions/index.html');

      expect($route.routes['/users/:id/billing'].controller).toBe('UsersShowController');
      expect($route.routes['/users/:id/billing'].templateUrl).
                  toEqual('components/users/billing/index.html');

      expect($route.routes['/users/:id/invoices'].controller).toBe('UsersShowController');
      expect($route.routes['/users/:id/invoices'].templateUrl).
                  toEqual('components/users/invoices/index.html');

      expect($route.routes['/users/:id/inventory'].controller).toBe('UsersShowController');
      expect($route.routes['/users/:id/inventory'].templateUrl).
                  toEqual('components/users/inventories/index.html');

      expect($route.routes['/users/:id/invoices/:invoice_id'].templateUrl).
                  toEqual('components/users/invoices/show.html');

      expect($route.routes['/users/:id/integrations'].controller).toBe('UsersShowController');
      expect($route.routes['/users/:id/integrations'].templateUrl).
                  toEqual('components/users/integrations/index.html');

      expect($route.routes['/me/integrations/:id'].controller).toBe('UsersIntegrationsController');
      expect($route.routes['/me/integrations/:id'].templateUrl).
                  toEqual('components/users/integrations/setup.html');

      expect($route.routes['/users/:id/branding'].controller).toBe('UsersShowController');
      expect($route.routes['/users/:id/branding'].templateUrl).
                  toEqual('components/users/branding/index.html');

      expect($route.routes['/users/:id/locations'].controller).toBe('UsersShowController');
      expect($route.routes['/users/:id/locations'].templateUrl).
                  toEqual('components/users/locations/index.html');

      expect($route.routes['/users/:id/users'].controller).toBe('UsersShowController');
      expect($route.routes['/users/:id/users'].templateUrl).
                  toEqual('components/users/users/index.html');

      expect($route.routes['/users/:id/usage'].controller).toBe('UsersShowController');
      expect($route.routes['/users/:id/usage'].templateUrl).
                  toEqual('components/users/usage/index.html');

      expect($route.routes['/users/:id/history'].controller).toBe('UsersShowController');
      expect($route.routes['/users/:id/history'].templateUrl).
                  toEqual('components/users/history/index.html');

      expect($route.routes['/users/:id/quotas'].controller).toBe('UsersShowController');
      expect($route.routes['/users/:id/quotas'].templateUrl).
                  toEqual('components/users/quotas/index.html');

      expect($route.routes['/audit'].templateUrl).
                  toEqual('components/audit/sessions/index.html');

      expect($route.routes['/audit/emails'].templateUrl).
                  toEqual('components/audit/emails/index.html');

      expect($route.routes['/audit/social'].templateUrl).
                  toEqual('components/audit/social/index.html');

      expect($route.routes['/audit/guests'].templateUrl).
                  toEqual('components/audit/guests/index.html');

      expect($route.routes['/audit/guests/:id'].templateUrl).
                  toEqual('components/audit/guests/show.html');

      expect($route.routes['/audit/sales'].templateUrl).
                  toEqual('components/audit/sales/index.html');

      expect($route.routes['/audit/sales/:id'].templateUrl).
                  toEqual('components/audit/sales/show.html');

      expect($route.routes['/create'].templateUrl).
                  toEqual('components/registrations/create.html');

      expect($route.routes['/success'].templateUrl).
                  toEqual('components/registrations/success.html');

      expect($route.routes['/create/:id'].templateUrl).
                  toEqual('components/registrations/flow.html');

      expect($route.routes['/brand-404'].templateUrl).
                  toEqual('components/home/brand-not-found.html');

    });

  });

});

