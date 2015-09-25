'use strict';
(function (angular) {
  angular
    .module('eventsManualPluginContent')
    .controller('ContentEventCtrl', ['$scope', '$routeParams', 'Buildfire', 'DataStore', 'TAG_NAMES',
      function ($scope, $routeParams, Buildfire, DataStore, TAG_NAMES) {
        var ContentEvent = this;
        ContentEvent.event = {};

        // create a new instance of the buildfire carousel editor
        var editor = new Buildfire.components.carousel.editor("#carousel");
        // this method will be called when a new item added to the list
        editor.onAddItems = function (items) {
          if (!ContentEvent.event.carouselImages)
            ContentEvent.event.carouselImages = [];
          ContentEvent.event.carouselImages.push.apply(ContentEvent.event.carouselImages, items);
          $scope.$digest();
        };
        // this method will be called when an item deleted from the list
        editor.onDeleteItem = function (item, index) {
          ContentEvent.event.carouselImages.splice(index, 1);
          $scope.$digest();
        };
        // this method will be called when you edit item details
        editor.onItemChange = function (item, index) {
          ContentEvent.event.carouselImages.splice(index, 1, item);
          $scope.$digest();
        };
        // this method will be called when you change the order of items
        editor.onOrderChange = function (item, oldIndex, newIndex) {
          var temp = ContentEvent.event.carouselImages[oldIndex];
          ContentEvent.event.carouselImages[oldIndex] = ContentEvent.event.carouselImages[newIndex];
          ContentEvent.event.carouselImages[newIndex] = temp;
          $scope.$digest();
        };

        var tmrDelayForEvent = null;
        var updateItemsWithDelay = function () {
          clearTimeout(tmrDelayForEvent);
          var success = function (result) {
              console.info('Init success result:', result);
              if (tmrDelayForEvent)clearTimeout(tmrDelayForEvent);
            }
            , error = function (err) {

            };
          DataStore.insert(ContentEvent.event, TAG_NAMES.EVENTS_MANUAL).then(success, error);
        };

        $scope.$watch(function () {
          return ContentEvent.event;
        }, updateItemsWithDelay, true);

      }]);
})(window.angular);
