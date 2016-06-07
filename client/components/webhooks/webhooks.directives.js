'use strict';

var app = angular.module('myApp.webhooks.directives', []);

app.directive('webhooks', ['Webhook', '$routeParams', function(Webhook, $routeParams) {

  function link ( scope, element, attrs ) {

  }

  return {
    link: link,
    scope: {
      webhook: '='
    },
    template:
      '<div class=\'row\'>'+
      '<div class="small-12 medium-4 columns webhooks">'+
      '<input type="checkbox" name="" ng-model="webhook.box.online"/>' +
      '<label for="webhook_url">Box online</label>'+
      '<br>'+
      '<input type="checkbox" name="" ng-model="webhook.box.offline"/>' +
      '<label for="webhook_url">Box offline</label>'+
      '<br>'+
      '<input type="checkbox" name="" ng-model="webhook.box.created"/>'+
      '<label for="webhook_url">Box created</label>' +
      '<br>'+
      '<input type="checkbox" name="" ng-model="webhook.box.reset"/>'+
      '<label for="webhook_url">Box reset</label>' +
      '<br>'+
      '<input type="checkbox" name="" ng-model="webhook.box.transferred"/>'+
      '<label for="webhook_url">Box transferred</label>' +
      '<br>'+
      '<input type="checkbox" name="" ng-model="webhook.box.removed"/>'+
      '<label for="webhook_url">Box removed</label>' +
      '<br>'+
      '<input type="checkbox" name="" ng-model="webhook.box.rebooted"/>'+
      '<label for="webhook_url">Box rebooted</label>' +
      '<br>'+
      '<input type="checkbox" name="" ng-model="webhook.box.upgraded"/>'+
      '<label for="webhook_url">Box upgraded</label>' +
      '<br>'+
      '</div>' +
      '<div class="small-12 medium-4 columns webhooks">'+
      '<input type="checkbox" name="" ng-model="webhook.venue.created"/>' +
      '<label for="webhook_url">Venue created</label>'+
      '<br>'+
      '<input type="checkbox" name="" ng-model="webhook.venue.transferred"/>' +
      '<label for="webhook_url">Venue transferred</label>'+
      '<br>'+
      '<input type="checkbox" name="" ng-model="webhook.venue.new_client"/>' +
      '<label for="webhook_url">Venue new client </label>'+
      '<br>'+
      '<input type="checkbox" name="" ng-model="webhook.venue.new_guest"/>' +
      '<label for="webhook_url">Venue new guest</label>'+
      '<br>'+
      '<input type="checkbox" name="" ng-model="webhook.venue.new_email"/>' +
      '<label for="webhook_url">Venue new email</label>'+
      '<br>'+
      '<input type="checkbox" name="" ng-model="webhook.venue.blocked_user"/>' +
      '<label for="webhook_url">Venue blocked user</label>'+
      '<br>'+
      '</div>' +
      '<div class="small-12 medium-4 columns webhooks">'+
      '<input type="checkbox" name="" ng-model="webhook.sub.created"/>' +
      '<label for="webhook_url">Sub.created created</label>'+
      '<br>'+
      '<input type="checkbox" name="" ng-model="webhook.sub.cancel"/>' +
      '<label for="webhook_url">Sub. cancelled</label>'+
      '<br>'+
      '<input type="checkbox" name="" ng-model="webhook.sub.updated"/>' +
      '<label for="webhook_url">Sub. updated</label>'+
      '<br>'+
      '<input type="checkbox" name="" ng-model="webhook.sub.invoice"/>' +
      '<label for="webhook_url">New invoice</label>'+
      '<br>'+
      '<input type="checkbox" name="" ng-model="webhook.sub.card"/>' +
      '<label for="webhook_url">Credit card changed</label>'+
      '<br>'+
      '<input type="checkbox" name="" ng-model="webhook.sub.failed"/>' +
      '<label for="webhook_url">Failed payment</label>'+
      '<br>'+
      '<input type="checkbox" name="" ng-model="webhook.admin.created"/>'+
      '<label for="webhook_url">Admin created</label>' +
      '<br>'+
      '<input type="checkbox" name="" ng-model="webhook.admin.accepted"/>'+
      '<label for="webhook_url">Admin accepted</label>' +
      '<br>'+
      '<input type="checkbox" name="" ng-model="webhook.admin.removed"/>'+
      '<label for="webhook_url">Admin removed</label>' +
      '</div>' +
      '</div>'
  };

}]);

