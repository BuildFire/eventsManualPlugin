'use strict';

(function (angular, buildfire) {
  angular.module('eventsManualPluginWidget')
    .controller('WidgetEventCtrl', ['$scope', 'DataStore', 'TAG_NAMES', 'LAYOUTS', '$routeParams', '$sce', '$rootScope',
      function ($scope, DataStore, TAG_NAMES, LAYOUTS, $routeParams, $sce, $rootScope) {

        var WidgetEvent = this;
        WidgetEvent.data = {};
        WidgetEvent.event = null;
        //create new instance of buildfire carousel viewer
        var view = null;

        var getEventDetails = function (url) {
          var success = function (result) {
              console.log(">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>", result);
              WidgetEvent.event = result;
            }
            , error = function (err) {
              console.error('Error In Fetching Event', err);
            };
          if ($routeParams.id)
            DataStore.get(TAG_NAMES.EVENTS_MANUAL).then(success, error);
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

        WidgetEvent.safeHtml = function (html) {
          if (html)
            return $sce.trustAsHtml(html);
        };

        WidgetEvent.executeActionItem = function (actionItem) {
          buildfire.actionItems.execute(actionItem, function () {

          });
        };

        $rootScope.$on("Carousel:LOADED", function () {
          console.log("*******************************",WidgetEvent.event);
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
