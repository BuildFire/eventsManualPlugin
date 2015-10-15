'use strict';

(function (angular, buildfire) {
  angular.module('eventsManualPluginWidget')
    .controller('WidgetEventCtrl', ['$scope', 'DataStore', 'TAG_NAMES', 'LAYOUTS', '$routeParams', '$sce', '$rootScope', 'Buildfire', '$location',
      function ($scope, DataStore, TAG_NAMES, LAYOUTS, $routeParams, $sce, $rootScope, Buildfire, $location) {

        var WidgetEvent = this;
        WidgetEvent.data = {};
        WidgetEvent.event = {};
        var currentListLayout = null;

        //create new instance of buildfire carousel viewer
        WidgetEvent.view = null;

        var _searchObj = $location.search();

        if ($routeParams.id && !_searchObj.stopSwitch) {
          buildfire.messaging.sendMessageToControl({
            id: $routeParams.id,
            type: 'OpenItem'
          });
        }

        var getEventDetails = function (url) {
          var success = function (result) {
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
        var initDeviceSize = function(callback) {
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
        };

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

        WidgetEvent.safeHtml = function (html) {
          if (html)
            return $sce.trustAsHtml(html);
        };

        WidgetEvent.executeActionItem = function (actionItem) {
          buildfire.actionItems.execute(actionItem, function () {

          });
        };

        //Check is description is empty or not
        WidgetEvent.showDescription = function (description) {
          return !(description == '<p><br data-mce-bogus="1"></p>');
        };

        /*update data on change event*/
        var onUpdateCallback = function (event) {
          setTimeout(function () {
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

                  break;
                case TAG_NAMES.EVENTS_MANUAL:
                  if (event.data)
                    WidgetEvent.event.data = event.data;
                  if (WidgetEvent.view) {
                    console.log("_____________________________");
                    WidgetEvent.view.loadItems(WidgetEvent.event.data.carouselImages);
                  }
                  break;
              }
              $scope.$digest();
            }
          }, 0);
        };

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

        DataStore.onUpdate().then(null, null, onUpdateCallback);

        $scope.$on("$destroy", function () {
          DataStore.clearListener();
        });

        $rootScope.$on("Carousel:LOADED", function () {
          if (!WidgetEvent.view) {
            WidgetEvent.view = new buildfire.components.carousel.view("#carousel", []);
          }
          if (WidgetEvent.event.data && WidgetEvent.event.data.carouselImages) {
            WidgetEvent.view.loadItems(WidgetEvent.event.data.carouselImages);
          } else {
            WidgetEvent.view.loadItems([]);
          }
        });

        WidgetEvent.onAddressClick = function (long,lat) {
          if (buildfire.context.device && buildfire.context.device.platform == 'ios')
            window.open("maps://maps.google.com/maps?daddr=" + lat + "," + long);
          else
            window.open("http://maps.google.com/maps?daddr=" + lat + "," + long);
        }

      }]);
})(window.angular, window.buildfire);
