'use strict';

(function (angular) {
  angular.module('eventsManualPluginContent', ['ngRoute', 'ui.tinymce','ui.bootstrap'])
    //injected ngRoute for routing
    .config(['$routeProvider', function ($routeProvider) {
      $routeProvider
        .when('/', {
          templateUrl: 'templates/home.html',
          controllerAs: 'ContentHome',
          controller: 'ContentHomeCtrl'
        })
        .when('/event', {
          templateUrl: 'templates/event.html',
          controllerAs: 'ContentEvent',
          controller: 'ContentEventCtrl'
        })
        .when('/event/:id', {
          templateUrl: 'templates/event.html',
          controllerAs: 'ContentEvent',
          controller: 'ContentEventCtrl'
        })
        .otherwise('/');
    }])
    .directive('googleLocationSearch', function () {
      return {
        restrict: 'A',
        scope: {setLocationInController: '&callbackFn'},
        link: function (scope, element, attributes) {
          var options = {
            types: ['geocode']
          };
          var autocomplete = new google.maps.places.Autocomplete(element[0], options);
          google.maps.event.addListener(autocomplete, 'place_changed', function () {
            var location = autocomplete.getPlace().formatted_address;
            if (autocomplete.getPlace().geometry) {
              var coordinates = [autocomplete.getPlace().geometry.location.lng(), autocomplete.getPlace().geometry.location.lat()];
              scope.setLocationInController({
                data: {
                  location: location,
                  coordinates: coordinates
                }
              });
            }
          });
        }
      };
    })
})(window.angular);