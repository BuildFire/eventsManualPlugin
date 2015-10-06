'use strict';

(function (angular, buildfire) {
  angular.module('eventsManualPluginWidget')
    .controller('WidgetEventCtrl', ['$scope', 'DataStore', 'TAG_NAMES', 'LAYOUTS', '$routeParams', '$sce', '$rootScope', 'Buildfire', '$location',
      function ($scope, DataStore, TAG_NAMES, LAYOUTS, $routeParams, $sce, $rootScope, Buildfire, $location) {

        var WidgetEvent = this;
        WidgetEvent.data = {};
        WidgetEvent.event = null;
        var currentListLayout = null;
        //create new instance of buildfire carousel viewer
        var view = null;

        var _searchObj = $location.search();
        if ($routeParams.id && !_searchObj.stopSwitch) {
          buildfire.messaging.sendMessageToControl({
            id: $routeParams.id,
            type: 'OpenItem'
          });
        }

        var getEventDetails = function (url) {
          var success = function (result) {
              console.log(">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>", result);
              WidgetEvent.event = result;
            }
            , error = function (err) {
              console.error('Error In Fetching Event', err);
            };
          if ($routeParams.id)
            DataStore.getById($routeParams.id, TAG_NAMES.EVENTS_MANUAL).then(success, error);
        };

        /*declare the device width heights*/
        WidgetEvent.deviceHeight = window.innerHeight;
        WidgetEvent.deviceWidth = window.innerWidth;

        /*initialize the device width heights*/
        function initDeviceSize(callback) {
          WidgetEvent.deviceHeight = window.innerHeight;
          WidgetEvent.deviceWidth = window.innerWidth;
          if (callback) {
            if (WidgetEvent.deviceWidth == 0 || WidgetEvent.deviceHeight == 0) {
              setTimeout(function () {
                initDeviceSize(callback);
              }, 500);
            } else {
              callback();
              if (!$scope.$$phase && !$scope.$root.$$phase) {
                $scope.$apply();
              }
            }
          }
        }

        /*crop image on the basis of width heights*/
        WidgetEvent.cropImage = function (url, settings) {
          var options = {};
          if (!url) {
            return "";
          }
          else {
            if (settings.height) {
              options.height = settings.height;
            }
            if (settings.width) {
              options.width = settings.width;
            }
            return Buildfire.imageLib.cropImage(url, options);
          }
        };
        /*update data on change event*/
        var onUpdateCallback = function (event) {
          setTimeout(function () {
            $scope.imagesUpdated = false;
            $scope.$digest();
            if (event && event.tag) {
              switch (event.tag) {
                case TAG_NAMES.EVENTS_MANUAL_INFO:
                  WidgetEvent.data = event.data;
                  if (!WidgetEvent.data.design)
                    WidgetEvent.data.design = {};
                  if (!WidgetEvent.data.design.itemDetailsLayout) {
                    WidgetEvent.data.design.itemDetailsLayout = LAYOUTS.itemDetailsLayout[0].name;
                  }
                  currentListLayout = WidgetEvent.data.design.itemDetailsLayout;
                  $scope.imagesUpdated = !!event.data.content;
                  break;
                case TAG_NAMES.EVENTS_MANUAL:
                  if(event.data)
                    WidgetEvent.event.data = event.data;
                  break;
              }
              $scope.$digest();
            }
          }, 0);
        };
        DataStore.onUpdate().then(null, null, onUpdateCallback);


        /*
         * Fetch user's data from datastore
         */
        var init = function () {
          var success = function (result) {
              WidgetEvent.data = result.data;
              if (!WidgetEvent.data.design)
                WidgetEvent.data.design = {};
              if (!WidgetEvent.data.design.itemDetailsLayout) {
                WidgetEvent.data.design.itemDetailsLayout = LAYOUTS.itemDetailsLayout[0].name;
              }
              getEventDetails();
            }
            , error = function (err) {
              console.error('Error while getting data', err);
            };
          DataStore.get(TAG_NAMES.EVENTS_MANUAL_INFO).then(success, error);
        };
        init();

        WidgetEvent.safeHtml = function (html) {
          if (html)
            return $sce.trustAsHtml(html);
        };

        WidgetEvent.executeActionItem = function (actionItem) {
          buildfire.actionItems.execute(actionItem, function () {

          });
        };

        $scope.$on("$destroy", function () {
          DataStore.clearListener();
        });

        $rootScope.$on("Carousel:LOADED", function () {
          console.log("*******************************", WidgetEvent.event);
          if (!view) {
            view = new buildfire.components.carousel.view("#carousel", []);
          }
          if (WidgetEvent.event.data && WidgetEvent.event.data.carouselImages) {
            view.loadItems(WidgetEvent.event.data.carouselImages);
          } else {
            view.loadItems([]);
          }
        });
      }])
})(window.angular, window.buildfire);
