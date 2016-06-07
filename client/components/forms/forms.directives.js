'use strict';

var app = angular.module('myApp.forms.directives', []);

app.directive('listForms', ['Form', 'FormListing', 'Location', '$routeParams', '$rootScope', 'showToast', 'showErrors', 'menu', '$mdDialog', function(Form, FormListing, Location, $routeParams, $rootScope, showToast, showErrors, menu, $mdDialog) {

  var link = function(scope,element,attrs) {

    scope.types = [{ key: 'Email', value: 'email'}, {key: 'Password', value: 'password'}, {key: 'Text', value: 'text'}, {key: 'Checkbox', value: 'checkbox'}, {key: 'Text Area', value: 'textarea'}, {key: 'Radio', value: 'radio'}, {key: 'Dropdown', value: 'dropdown' }];

    scope.location  = { slug: $routeParams.id };
    scope.splash    = { id: $routeParams.splash_page_id, location_id: $routeParams.id };

    var onDrag;
    var drake = window.dragula({
      isContainer: function (el) {
        return false;
      }
    });

    drake.containers.push(document.querySelector('#dragable'));

    var listener = function(el,target,source,sib) {
      onDrag = true;
      var c = $(el).parent().children();
      var id;
      for (var i = 0; i < c.length; i++) {
        id = $(c[i]).attr('id');
        for (var j = 0; j < scope.form.registration_fields.length; j++) {
          if (id === scope.form.registration_fields[j]._id) {
            scope.form.registration_fields[j].order = i;
            break;
          }
        }
      }
      scope.save();
    };

    drake.on('drop', listener);

    var init = function() {
      Form.get({location_id: scope.location.slug, splash_page_id: scope.splash.id }).$promise.then(function(results) {
        if (results === undefined || results.id === undefined) {
          buildForm();
        } else {
          scope.form = results;
          if (results.registration_fields && results.registration_fields.length >= 10) {
            scope.at_limit = true;
          }
        }
        scope.loading = undefined;
        scope.addField();
      }, function(error) {
      });
    };

    var buildForm = function() {
      scope.form = {};
      var fields = [];
      var field  = {
        name: 'username',
        required: true,
        field_type: 'email',
        hidden: false,
        label: 'Enter your Email',
        value: '',
        order: 1
      };
      var password  = {
        name: 'password',
        required: true,
        field_type: 'password',
        hidden: false,
        label: 'Choose a Password',
        value: '',
        order: 2
      };
      fields.push(field);
      fields.push(password);
      scope.form.message = 'Please enter your details to get online';
      scope.form.registration_fields = fields;
      scope.save();
    };

    scope.hightlight = function(index) {

    };

    scope.selectedInput = function(index) {
      scope.fieldSettings();
      scope.selectedIndex = index;
      scope.selected = scope.form.registration_fields[index];
    };

    scope.addField = function() {
      scope.fieldSettingsF = undefined;
      scope.addFieldF = true;
    };

    scope.fieldSettings = function() {
      if ( scope.selected === undefined ) {
        scope.selected = scope.form.registration_fields[0];
      }
      scope.fieldSettingsF = true;
      scope.addFieldF = undefined;
    };

    scope.save = function(form) {

      if (form) {
        form.$setPristine();
      }

      if (scope.selected && !scope.selected._id && !onDrag) {
        scope.selected._destroy = undefined;
        scope.selected.order = scope.form.registration_fields.length + 1;
        scope.form.registration_fields.push(scope.selected);
      }

      var params = scope.form;
      if (scope.form.registration_fields) {
        params.registration_fields_attributes = scope.form.registration_fields;
        // So we don't send a load of JSON and can restore later //
        // scope.fields_backup = params.registration_fields;
        // params.registration_fields = undefined;
      }
      if (scope.form.id) {
        updateForm(params);
      } else {
        createForm(params);
      }

      onDrag = undefined;
    };

    var createForm = function(params) {
      Form.create({location_id: scope.location.slug, splash_page_id: scope.splash.id, form: params }).$promise.then(function(results) {
        scope.form = results;
        scope.newField();
      }, function(err) {
        formErrored(err);
      });
    };

    var updateForm = function(params) {
      Form.update({id: scope.form.id, location_id: scope.location.slug, splash_page_id: scope.splash.id, form: params }).$promise.then(function(results) {
        scope.form = results;
        showToast('Form successfully updated.');
        scope.newField();
      }, function(err) {
        formErrored(err);
      });
    };

    scope.toggle = function(section) {
      menu.toggleSelectSection(section);
    };

    scope.isOpen = function(section) {
      return menu.isSectionSelected(section);
    };

    var formErrored = function(err) {
      if (scope.selected._id !== undefined && scope.form && scope.form.registration_fields) {
        scope.form.registration_fields.pop();
      }
      showErrors(err);
    };

    scope.newField = function() {
      scope.selected = {
        field_type: 'text',
        required: false,
        hidden: false,
        _destroy: true
      };
    };

    scope.deleteField = function() {
      var confirm = $mdDialog.confirm()
      .title('Delete Field')
      .textContent('Deleting a field will wipe all your data, please be careful.')
      .ariaLabel('Delete Field')
      .ok('Delete')
      .cancel('Cancel');
      $mdDialog.show(confirm).then(function() {
        deleteField();
      }, function() {
      });
    };

    var deleteField = function(id) {
      for (var i = 0; i < scope.form.registration_fields.length; i++) {
        if ( scope.form.registration_fields[i]._id === scope.selected._id ) {
          scope.form.registration_fields[i]._destroy = true;
          scope.save();
          break;
        }
      }
    };

    scope.back = function() {
      window.location.href = '/#/locations/' + scope.location.slug + '/splash_pages/' + scope.splash.id;
    };

    init();
    // scope.newField();

  };

  return {
    link: link,
    scope: {
      splash: '=',
      loading: '='
    },
    templateUrl: 'components/splash_pages/_form_designer.html'
  };

}]);
