'use strict';

(function (angular) {
  angular
    .module('eventsManualPluginContent')
    .controller('DeepLinkPopupCtrl', ['$scope', '$modalInstance', 'deepLink',
      function ($scope, $modalInstance, deepLink) {
        var DeepLinkPopup = this;
        if (deepLink) {
          DeepLinkPopup.deepLink = deepLink;
        }
        DeepLinkPopup.cancel = function () {
          $modalInstance.dismiss('Close');
        };
      }]);
})(window.angular);