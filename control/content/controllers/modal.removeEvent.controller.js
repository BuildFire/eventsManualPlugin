'use strict';

(function (angular) {
  angular
    .module('eventsManualPluginContent')
    .controller('RemoveEventPopupCtrl', ['$scope', '$modalInstance', 'eventsManualData',
      function ($scope, $modalInstance, eventsManualData) {
        var RemoveEventPopup = this;
        if (eventsManualData) {
          RemoveEventPopup.eventsManualData = eventsManualData;
        }
        RemoveEventPopup.ok = function () {
          localStorage.setItem('pluginLoadedFirst', true);
          $modalInstance.close('yes');
        };
        RemoveEventPopup.cancel = function () {
          $modalInstance.dismiss('No');
        };
      }])
})(window.angular);
