'use strict';

(function (angular) {
  angular
    .module('eventsManualPluginContent')
      .controller('ContentHomeCtrl', ['$scope', 'TAG_NAMES', 'STATUS_CODE', 'DataStore', 'LAYOUTS','$sce','Buildfire','$modal',
        function ($scope, TAG_NAMES, STATUS_CODE, DataStore, LAYOUTS,$sce,Buildfire,$modal) {
          var _data = {
          "content": {},
          "design": {
            "itemDetailsLayout": LAYOUTS.itemDetailLayouts[0].name,
            "itemDetailsBgImage": ""
          }
        };
        var ContentHome = this;
        ContentHome.searchEvent=null;
        /*
         * ContentHome.events used to store the list of events fetched from datastore.
         */
        ContentHome.events = null;

        /*
         * ContentHome.data used to store EventsInfo which from datastore.
         */
        ContentHome.masterData = null;
        ContentHome.data = angular.copy(_data);

        function updateMasterItem(data) {
          ContentHome.masterData = angular.copy(data);
        }

        function isUnchanged(data) {
          return angular.equals(data, ContentHome.masterData);
        }

        /*
         * Go pull any previously saved data
         * */
        var init = function () {
          var success = function (result) {
              console.info('Init success result:', result);
              ContentHome.data = result.data;
              if (ContentHome.data) {
                if (!ContentHome.data.content)
                  ContentHome.data.content = {};
                updateMasterItem(ContentHome.data);
              }
              if (tmrDelay)clearTimeout(tmrDelay);
            }
            , error = function (err) {
              if (err && err.code !== STATUS_CODE.NOT_FOUND) {
                console.error('Error while getting data', err);
                if (tmrDelay)clearTimeout(tmrDelay);
              }
              else if (err && err.code === STATUS_CODE.NOT_FOUND) {
                saveData(JSON.parse(angular.toJson(ContentHome.data)), TAG_NAMES.EVENTS_MANUAL_INFO);
              }
            };

          var successEvents = function (result) {
            ContentHome.events = result;
            console.log("ddddd",ContentHome.events)
          }, errorEvents = function () {

          };
          DataStore.get(TAG_NAMES.EVENTS_MANUAL_INFO).then(success, error);
          DataStore.search({}, TAG_NAMES.EVENTS_MANUAL).then(successEvents, errorEvents);
        };
        init();
        ContentHome.safeHtml = function (html) {
          if (html)
            return $sce.trustAsHtml(html);
        };
        ContentHome.searchEvents = function()
        {
          console.log(ContentHome.searchEvent);
          var successEvents = function (result) {
            ContentHome.events = result;
           }, errorEvents = function (err) {
            console.log(err)
          };
          DataStore.search({filter:{"$or":[{"$json.id":ContentHome.searchEvent}]}}, TAG_NAMES.EVENTS_MANUAL).then(successEvents, errorEvents);
        };

        ContentHome.removeEvent = function (eventId, index) {
          var status = function (result) {
              console.log(result)
              },
              err = function (err) {
            console.log(err)
          }
          var modalInstance = $modal.open({
            templateUrl: 'templates/modals/remove-event.html',
            controller: 'RemoveEventPopupCtrl',
            controllerAs: 'RemoveEventPopup',
            size: 'sm',
            resolve: {
              eventsManualData: function () {
                return ContentHome.events[index];
              }
            }
          });
          modalInstance.result.then(function (message) {
            if (message === 'yes') {
              ContentHome.events.splice(index, 1);
              DataStore.deleteById(eventId,TAG_NAMES.EVENTS_MANUAL).then(status, err)
            }
          }, function (data) {
            //do something on cancel
          });
        };
        /*
         * Call the datastore to save the data object
         */
        var saveData = function (newObj, tag) {
          if (typeof newObj === 'undefined') {
            return;
          }
          var success = function (result) {
              console.info('Saved data result: ', result);
              updateMasterItem(newObj);
            }
            , error = function (err) {
              console.error('Error while saving data : ', err);
            };
          DataStore.save(newObj, tag).then(success, error);
        };


        /*
         * create an artificial delay so api isnt called on every character entered
         * */
        var tmrDelay = null;
        var saveDataWithDelay = function (newObj) {
          if (newObj) {
            if (isUnchanged(newObj)) {
              return;
            }
            if (tmrDelay) {
              clearTimeout(tmrDelay);
            }
            tmrDelay = setTimeout(function () {
              saveData(JSON.parse(angular.toJson(newObj)), TAG_NAMES.EVENTS_MANUAL_INFO);
            }, 500);
          }
        };
        /*
         * watch for changes in data and trigger the saveDataWithDelay function on change
         * */
        $scope.$watch(function () {
          return ContentHome.data;
        }, saveDataWithDelay, true);

      }]);
})(window.angular);
