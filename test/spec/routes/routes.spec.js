'use strict';

describe('Routing', function () {

  beforeEach(module('myApp'));

  it('should map routes to controllers', function() {

    inject(function($route) {

      // expect($route.routes['/'].controller).toBe('LocationsCtrl');
      expect($route.routes['/'].templateUrl).
                  toEqual('components/locations/index/index.html');

      expect($route.routes['/login'].templateUrl).
                  toEqual('components/home/hello.html');

      expect($route.routes['/aes'].templateUrl).
                  toEqual('components/app_events/index.html');

      expect($route.routes['/aes/:id'].templateUrl).
                  toEqual('components/app_events/show.html');

      expect($route.routes['/reset_password'].templateUrl).
                  toEqual('components/home/reset-pass.html');

      expect($route.routes['/update_password'].templateUrl).
                  toEqual('components/home/update-pass.html');

      expect($route.routes['/maintenance'].controller).toBe('UpgradesController');
      expect($route.routes['/maintenance'].templateUrl).
                  toEqual('components/upgrades/index.html');

      expect($route.routes['/apps'].templateUrl).
                  toEqual('components/apps/index.html');

      expect($route.routes['/apps/:id'].templateUrl).
                  toEqual('components/apps/show.html');

      expect($route.routes['/apps/:id/edit'].templateUrl).
                  toEqual('components/apps/new.html');

      expect($route.routes['/apps/new'].templateUrl).
                  toEqual('components/apps/new.html');

      expect($route.routes['/alerts'].templateUrl).
                  toEqual('components/alerts/index.html');

      expect($route.routes['/distributors/:id'].templateUrl).
                  toEqual('components/distros/distro.html');

      expect($route.routes['/referrals'].templateUrl).
                  toEqual('components/distros/referrals.html');

      expect($route.routes['/boxes'].controller).toBe('BoxesController');
      expect($route.routes['/boxes'].templateUrl).
                  toEqual('components/boxes/index/index.html');

      expect($route.routes['/downloads'].templateUrl).
                  toEqual('components/boxes/downloads/index.html');

      expect($route.routes['/firmwares'].templateUrl).
                  toEqual('components/firmwares/index.html');

      expect($route.routes['/locations/map'].templateUrl).
                  toEqual('components/locations/map/index.html');

      expect($route.routes['/locations/new'].controller).toBe('LocationsCtrlNew');
      expect($route.routes['/locations/new'].templateUrl).
                  toEqual('components/locations/new/index.html');

      expect($route.routes['/locations/:id'].controller).toBe('LocationsCtrlGet');
      expect($route.routes['/locations/:id'].templateUrl).
                  toEqual('components/locations/show/index.html');

      expect($route.routes['/locations/:id/access'].controller).toBe('LocationsCtrlAccess');
      expect($route.routes['/locations/:id/access'].templateUrl).
                  toEqual('components/locations/access/index.html');

      expect($route.routes['/locations/:id/clients'].templateUrl).
                  toEqual('components/locations/clients/index.html');

      expect($route.routes['/locations/:id/clients/:client_id'].templateUrl).
                  toEqual('components/locations/clients/show.html');

      expect($route.routes['/locations/:id/clients/:client_id/codes'].templateUrl).
                  toEqual('components/locations/clients/vouchers.html');

      expect($route.routes['/locations/:id/clients/:client_id/social/:social_id'].templateUrl).
                  toEqual('components/locations/clients/social.html');

      expect($route.routes['/locations/:id/clients/:client_id/codes/:username'].templateUrl).
                  toEqual('components/locations/clients/show_code.html');

      expect($route.routes['/locations/:id/clients/:client_id/codes/:username/sessions'].templateUrl).
                  toEqual('components/locations/clients/sessions.html');

      expect($route.routes['/locations/:id/clients/:client_id/sessions'].templateUrl).
                  toEqual('components/locations/clients/sessions.html');

      expect($route.routes['/locations/:id/clients/:client_id/orders'].templateUrl).
                  toEqual('components/locations/clients/orders.html');

      expect($route.routes['/locations/:id/clients/:client_id/orders/:order_id'].templateUrl).
                  toEqual('components/locations/clients/show_order.html');

      expect($route.routes['/events'].templateUrl).
                  toEqual('components/events/index.html');

      expect($route.routes['/events/:id'].templateUrl).
                  toEqual('components/events/show.html');

      expect($route.routes['/locations/:id/location_events'].controller).toBe('LocationsCtrlEvents');
      expect($route.routes['/locations/:id/location_events'].templateUrl).
                  toEqual('components/locations/events/index.html');

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

      expect($route.routes['/locations/:id/triggers/:trigger_id/trigger_history/:history_id'].templateUrl).
                  toEqual('components/locations/triggers/history/show.html');

      expect($route.routes['/locations/:id/integrations'].controller).toBe('LocationsCtrlIntegrations');
      expect($route.routes['/locations/:id/integrations'].templateUrl).
                  toEqual('components/locations/integrations/index.html');

      expect($route.routes['/locations/:id/layout'].controller).toBe('LocationsCtrlLayout');
      expect($route.routes['/locations/:id/layout'].templateUrl).
                  toEqual('components/locations/layout/index.html');

      expect($route.routes['/locations/:id/settings'].controller).toBe('LocationsCtrl');
      expect($route.routes['/locations/:id/settings'].templateUrl).
                  toEqual('components/locations/settings/index.html');

      expect($route.routes['/locations/:id/settings/notifications'].controller).toBe('LocationsCtrl');
      expect($route.routes['/locations/:id/settings/notifications'].templateUrl).
                  toEqual('components/locations/settings/notifications.html');

      expect($route.routes['/locations/:id/settings/devices'].controller).toBe('LocationsCtrl');
      expect($route.routes['/locations/:id/settings/devices'].templateUrl).
                  toEqual('components/locations/settings/devices.html');

      expect($route.routes['/locations/:id/settings/splash'].controller).toBe('LocationsCtrl');
      expect($route.routes['/locations/:id/settings/splash'].templateUrl).
                  toEqual('components/locations/settings/splash.html');

      expect($route.routes['/locations/:id/settings/analytics'].controller).toBe('LocationsCtrl');
      expect($route.routes['/locations/:id/settings/analytics'].templateUrl).
                  toEqual('components/locations/settings/analytics.html');

      expect($route.routes['/locations/:id/networks'].templateUrl).
                  toEqual('components/locations/networks/index.html');

      expect($route.routes['/locations/:id/networks/:network_id'].templateUrl).
                  toEqual('components/locations/networks/show.html');

      expect($route.routes['/locations/:id/networks/new'].templateUrl).
                  toEqual('components/locations/networks/new.html');

      expect($route.routes['/locations/:id/versions'].controller).toBe('VersionsCtrlLocations');
      expect($route.routes['/locations/:id/versions'].templateUrl).
                  toEqual('components/locations/versions/index.html');

      expect($route.routes['/locations/:id/zones'].templateUrl).
                  toEqual('components/zones/index.html');

      expect($route.routes['/locations/:id/zones/:zone_id'].controller).toBe('ZonesCtrlShow');
      expect($route.routes['/locations/:id/zones/:zone_id'].templateUrl).
                  toEqual('components/zones/show.html');

      expect($route.routes['/locations/:id/vouchers'].controller).toBe('VouchersController');
      expect($route.routes['/locations/:id/vouchers'].templateUrl).
                  toEqual('components/vouchers/index.html');

      expect($route.routes['/locations/:id/vouchers/new'].controller).toBe('VouchersNewController');
      expect($route.routes['/locations/:id/vouchers/new'].templateUrl).
                  toEqual('components/vouchers/new.html');

      expect($route.routes['/locations/:id/vouchers/:voucher_id'].controller).toBe('VouchersNewController');
      expect($route.routes['/locations/:id/vouchers/:voucher_id'].templateUrl).
                  toEqual('components/vouchers/show.html');

      expect($route.routes['/locations/:id/vouchers/:voucher_id/codes'].controller).toBe('VouchersNewController');
      expect($route.routes['/locations/:id/vouchers/:voucher_id/codes'].templateUrl).
                  toEqual('components/codes/vouchers_index.html');

      expect($route.routes['/locations/:id/splash_codes'].templateUrl).
                  toEqual('components/splash_codes/index.html');

      expect($route.routes['/locations/:id/splash_codes/new'].templateUrl).
                  toEqual('components/splash_codes/new.html');

      expect($route.routes['/locations/:id/splash_codes/:id'].templateUrl).
                  toEqual('components/splash_codes/show.html');

      expect($route.routes['/locations/:id/splash_pages'].templateUrl).
                  toEqual('components/splash_pages/index.html');

      expect($route.routes['/locations/:id/splash_pages/new'].controller).toBe('SplashPagesCtrlNew');
      expect($route.routes['/locations/:id/splash_pages/new'].templateUrl).
                  toEqual('components/splash_pages/new.html');

      expect($route.routes['/locations/:id/splash_pages/:splash_id'].controller).toBe('SplashPagesCtrlShow');
      expect($route.routes['/locations/:id/splash_pages/:splash_id'].templateUrl).
                  toEqual('components/splash_pages/show.html');

      expect($route.routes['/locations/:id/splash_pages/:splash_id/design'].templateUrl).
                  toEqual('components/splash_pages/design.html');

      expect($route.routes['/locations/:id/splash_pages/:splash_id/forms'].templateUrl).
                  toEqual('components/splash_pages/forms.html');

      expect($route.routes['/locations/:id/splash_pages/:splash_id/store'].templateUrl).
                  toEqual('components/splash_pages/store.html');

      expect($route.routes['/locations/new'].controller).toBe('LocationsCtrlNew');
      expect($route.routes['/locations/new'].templateUrl).
                  toEqual('components/locations/new/index.html');

      // expect($route.routes['/locations/:id/boxes'].templateUrl).
      //             toEqual('components/boxes/location-index/index.html');

      // expect($route.routes['/locations/:location_id/boxes/firmware'].templateUrl).
      //             toEqual('components/boxes/firmware/index.html');

      expect($route.routes['/locations/:id/boxes/new'].templateUrl).
                  toEqual('components/boxes/new/index.html');

      expect($route.routes['/locations/:id/boxes/:box_id'].controller).toBe('BoxesShowController');
      expect($route.routes['/locations/:id/boxes/:box_id'].templateUrl).
                  toEqual('components/boxes/show/index.html');

      expect($route.routes['/locations/:id/boxes/:box_id/edit'].controller).toBe('BoxesEditController');
      expect($route.routes['/locations/:id/boxes/:box_id/edit'].templateUrl).
                  toEqual('components/boxes/edit/index.html');

      expect($route.routes['/locations/:id/boxes/:box_id/port_forwards'].controller).toBe('PortForwardsCtrl');
      expect($route.routes['/locations/:id/boxes/:box_id/port_forwards'].templateUrl).
                  toEqual('components/boxes/port_forwards/index.html');

      expect($route.routes['/locations/:id/boxes/:box_id/versions'].controller).toBe('VersionsCtrl');
      expect($route.routes['/locations/:id/boxes/:box_id/versions'].templateUrl).
                  toEqual('components/boxes/versions/index.html');

      expect($route.routes['/locations/:id/boxes/:box_id/stats'].controller).toBe('BoxesShowController');
      expect($route.routes['/locations/:id/boxes/:box_id/stats'].templateUrl).
                  toEqual('components/boxes/stats/index.html');

      expect($route.routes['/locations/:id/boxes/:box_id/state_events'].controller).toBe('StateEventsCtrl');
      expect($route.routes['/locations/:id/boxes/:box_id/state_events'].templateUrl).
                  toEqual('components/boxes/state_events/index.html');

      expect($route.routes['/locations/:id/boxes/:box_id/payloads'].controller).toBe('PayloadsController');
      expect($route.routes['/locations/:id/boxes/:box_id/payloads'].templateUrl).
                  toEqual('components/boxes/payloads/index.html');

      // expect($route.routes['/locations/:location_id/boxes/:box_id/payloads/:id'].controller).toBe('PayloadsShowController');
      // expect($route.routes['/locations/:location_id/boxes/:box_id/payloads/:id'].templateUrl).
      //             toEqual('components/boxes/payloads/show.html');

      expect($route.routes['/plans'].controller).toBe('PlansController');
      expect($route.routes['/plans'].templateUrl).
                  toEqual('components/plans/index.html');

      expect($route.routes['/plans/:id'].controller).toBe('PlansController');
      expect($route.routes['/plans/:id'].templateUrl).
                  toEqual('components/plans/show.html');

      expect($route.routes['/shop'].templateUrl).
                  toEqual('components/shop/index.html');

      expect($route.routes['/shop/cart'].templateUrl).
                  toEqual('components/shop/cart.html');

      expect($route.routes['/shop/finalised'].templateUrl).
                  toEqual('components/shop/finalised.html');

      expect($route.routes['/orders'].templateUrl).
                  toEqual('components/product_orders/index.html');

      expect($route.routes['/orders/:id'].templateUrl).
                  toEqual('components/product_orders/show.html');

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

      expect($route.routes['/users/:id/invoices/:invoice_id/invoice_items/:invoice_item_id'].templateUrl).
                  toEqual('components/users/billing/invoice_items/show.html');

      expect($route.routes['/users/:id/invoices/:invoice_id'].controller).toBe('InvoicesShowController');
      expect($route.routes['/users/:id/invoices/:invoice_id'].templateUrl).
                  toEqual('components/users/billing/invoices/show.html');

      expect($route.routes['/users/:id/integrations'].controller).toBe('UsersShowController');
      expect($route.routes['/users/:id/integrations'].templateUrl).
                  toEqual('components/users/integrations/index.html');

      expect($route.routes['/me/integrations/:id'].controller).toBe('UsersIntegrationsController');
      expect($route.routes['/me/integrations/:id'].templateUrl).
                  toEqual('components/users/integrations/setup.html');

      // expect($route.routes['/users/:id/alerts'].controller).toBe('UsersShowController');
      // expect($route.routes['/users/:id/alerts'].templateUrl).
      //             toEqual('components/users/alerts/index.html');

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

      expect($route.routes['/users/:id/orders'].controller).toBe('UsersShowController');
      expect($route.routes['/users/:id/orders'].templateUrl).
                  toEqual('components/users/orders/index.html');

      expect($route.routes['/users/:id/history'].controller).toBe('UsersShowController');
      expect($route.routes['/users/:id/history'].templateUrl).
                  toEqual('components/users/history/index.html');

      expect($route.routes['/users/:id/quotas'].controller).toBe('UsersShowController');
      expect($route.routes['/users/:id/quotas'].templateUrl).
                  toEqual('components/users/quotas/index.html');
      
      expect($route.routes['/reports/social'].templateUrl).
                  toEqual('components/reports/social/index.html');

      expect($route.routes['/reports/social/:social_id'].templateUrl).
                  toEqual('components/reports/social/show.html');

      expect($route.routes['/reports/sessions'].templateUrl).
                  toEqual('components/reports/sessions/index.html');

      expect($route.routes['/reports/emails'].templateUrl).
                  toEqual('components/reports/emails/index.html');

      expect($route.routes['/reports/online'].templateUrl).
                  toEqual('components/reports/splash_online/index.html');

      // expect($route.routes['/reports/codes'].templateUrl).
      //             toEqual('components/reports/codes/index.html');

      // expect($route.routes['/reports/codes/:id'].templateUrl).
      //             toEqual('components/reports/codes/show.html');

      expect($route.routes['/reports/orders'].templateUrl).
                  toEqual('components/reports/orders/index.html');

      expect($route.routes['/reports/orders/:id'].templateUrl).
                  toEqual('components/reports/orders/show.html');

      expect($route.routes['/reports/guests'].templateUrl).
                  toEqual('components/reports/guests/index.html');

      expect($route.routes['/reports/guests/:id'].templateUrl).
                  toEqual('components/reports/guests/show.html');

      // expect($route.routes['/analytics'].templateUrl).
      //             toEqual('components/analytics/index.html');

      expect($route.routes['/analytics'].templateUrl).
                  toEqual('components/analytics/boxpark.html');

      expect($route.routes['/analytics/sense'].templateUrl).
                  toEqual('components/analytics/sense/index.html');

      // expect($route.routes['/analytics/sense'].templateUrl).
      //             toEqual('components/analytics/sense/index.html');

      expect($route.routes['/analytics/sense/labs'].templateUrl).
                  toEqual('components/sense/labs.html');

      expect($route.routes['/analytics/sense/entry-exit'].templateUrl).
                  toEqual('components/analytics/sense/entry-exit.html');

      expect($route.routes['/stats/sessions'].templateUrl).
                  toEqual('components/stats/sessions/index.html');

      expect($route.routes['/stats/clients'].templateUrl).
                  toEqual('components/stats/clients/index.html');

      expect($route.routes['/stats/impressions'].templateUrl).
                  toEqual('components/stats/impressions/index.html');

      expect($route.routes['/stats/financials'].templateUrl).
                  toEqual('components/stats/financials/index.html');

      // expect($route.routes['/stats/codes'].templateUrl).
      //             toEqual('components/stats/codes/index.html');

      expect($route.routes['/stats/social'].templateUrl).
                  toEqual('components/stats/social/index.html');

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

