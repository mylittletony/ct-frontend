'use strict';

var app = angular.module('myApp.menu.directives', []);

app.run(['$templateCache', function ($templateCache) {
  $templateCache.put('partials/menu-toggle.tmpl.html',
    '<md-button class="md-button-toggle"'+
    'ng-click="toggle()"'+
    'aria-controls="docs-menu-{{section.name | nospace}}"'+
    'ng-class="{\'toggled\' : isOpen()}"'+
    'aria-expanded="{{isOpen()}}">'+
    '<div flex layout="row">'+
    '<md-icon md-menu-origin md-font-icon="{{ section.icon }}">{{ section.icon }}</md-icon>'+
    '{{section.name}}'+
    '<span flex></span>'+
    '<span aria-hidden="true" class="md-toggle-icon"'+
    'ng-class="{\'toggled\' : !isOpen()}">'+
    '<md-icon md-menu-origin md-font-icon="">keyboard_arrow_down</md-icon>'+
    '</span>'+
    '</div>'+
    '<span class="md-visually-hidden">'+
    'Toggle {{isOpen()? \'expanded\' : \'collapsed\'}}'+
    '</span>'+
    '</md-button>'+
    '<ul ng-show="isOpen(section)" id="docs-menu-{{section.name | nospace}}" class="menu-toggle-list">\n' +
    '<li ng-repeat="page in section.pages">'+
    '<menu-link section="page"></menu-link>'+
    '</li>'+
    '</ul>'+
    '');
}]);

app.directive('menuToggle', ['$timeout', function ($timeout ) {
  return {
    scope: {
      section: '='
    },
    templateUrl: 'partials/menu-toggle.tmpl.html',
    link: function (scope, element) {
      var controller = element.parent().controller();

      scope.isOpen = function (section) {
        return controller.isOpen(section);
      };

      scope.toggle = function () {
        controller.toggle(scope.section);
      };

      var parentNode = element[0].parentNode.parentNode.parentNode;
      if (parentNode.classList.contains('parent-list-item')) {
        var heading = parentNode.querySelector('h2');
        element[0].firstChild.setAttribute('aria-describedby', heading.id);
      }
    }
  };
}]);

app.run(['$templateCache', function ($templateCache) {
  $templateCache.put('partials/menu-link.tmpl.html',
    '<md-button ng-class="{\'active\' : section.active }" \n' +
    '  ui-sref-active="active" ui-sref="{{section.state}}" href=\'{{ section.link }}\' ng-click="focusSection(section)">\n' +
    '  <md-icon md-menu-origin md-font-icon="{{ section.icon }}">{{ section.icon }}</md-icon>'+
    '  {{section | humanizeDoc}}\n' +
    '</md-button>\n' +
    '');
}]);

app.directive('menuLink', ['$route', 'menu', '$mdMedia', function ($route, menu, $mdMedia) {
  return {
    scope: {
      section: '=',
      side: '@'
    },
    templateUrl: 'partials/menu-link.tmpl.html',
    link: function ($scope, $element, attrs) {
      var controller = $element.parent().controller();

      $scope.isSelected = function (section) {
        return controller.isSelected(section);
      };

      $scope.focusSection = function (section) {
        if (attrs.side !== 'right') {
          if ($mdMedia('gt-sm')) {
          } else {
            menu.isOpenLeft = !menu.isOpenLeft;
          }
        }
        controller.autoFocusContent = true;
      };
    }
  };
}]);

app.directive('sidebarMenu', ['$route', function ($route) {

  var link = function (scope, element, controller) {
  };

  return {
    scope: {
      sections: '='
    },
    // templateUrl: 'partials/sidebar.tmpl.html',
    templateUrl: 'components/locations/layouts/sidebar-v2.html',
    link: link
  };
}]);
