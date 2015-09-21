'use strict';

(function (angular, buildfire) {
  angular.module('eventsManualPluginWidget', ['ngRoute'])
    .config(['$routeProvider', function ($routeProvider) {
      $routeProvider
        .when('/', {
          templateUrl: 'templates/home.html',
          controllerAs: 'WidgetHome',
          controller: 'WidgetHomeCtrl'
        })
        .otherwise('/');
    }])
})(window.angular, window.buildfire);