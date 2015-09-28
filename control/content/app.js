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
})(window.angular);