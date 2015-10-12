'use strict';
(function (angular) {
  angular
    .module('eventsManualPluginDesign', ['ngRoute'])
    .config(['$routeProvider', function ($routeProvider) {
      $routeProvider
        .when('/', {
          templateUrl: 'templates/home.html',
          controllerAs: 'DesignHome',
          controller: 'DesignHomeCtrl'
        })
        .otherwise('/');
    }])
})(window.angular);
