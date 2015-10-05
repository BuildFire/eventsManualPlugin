'use strict';

(function (angular) {
  angular
    .module('eventsManualPluginContent')
      .controller('ContentHomeCtrl', ['$scope', 'TAG_NAMES', 'STATUS_CODE', 'DataStore', 'LAYOUTS', '$sce', 'PAGINATION', 'Buildfire', '$modal',
        function ($scope, TAG_NAMES, STATUS_CODE, DataStore, LAYOUTS, $sce, PAGINATION, Buildfire, $modal) {
          var _data = {
          "content": {},
          "design": {
            "itemDetailsLayout": LAYOUTS.itemDetailLayouts[0].name,
            "itemDetailsBgImage": ""
          }
        };
          var searchOptions = {
            skip: 0,
            limit: PAGINATION.eventsCount, // the plus one is to check if there are any more
            sort:{"startDate":1 }
          };
        var ContentHome = this;
        ContentHome.searchEvent = null;
        /*
         * ContentHome.events used to store the list of events fetched from datastore.
         */
        ContentHome.events = {};
        ContentHome.busy = false;

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


          DataStore.get(TAG_NAMES.EVENTS_MANUAL_INFO).then(success, error);
          };
        init();
        ContentHome.safeHtml = function (html) {
          if (html)
            return $sce.trustAsHtml(html);
        };
        ContentHome.searchEvents = function(search)
        {
          if (search) {
            var regex = "\\b" + search + "\\b";
            searchOptions.filter = {"$or": [{"data.title": {"$regex": regex, "$options": "i"}}]};
            }
           else {
            searchOptions.filter = {"data.title": {"$regex": '/*'}};
          }

          var successEvents = function (result) {
            Buildfire.spinner.hide();
            ContentHome.events = result;
          }, errorEvents = function (err) {
            Buildfire.spinner.hide();
            console.log("Error searching events:" +err)
          };
          DataStore.search(searchOptions, TAG_NAMES.EVENTS_MANUAL).then(successEvents, errorEvents);
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
              DataStore.deleteById(eventId, TAG_NAMES.EVENTS_MANUAL).then(status, err)
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

          var getManualEvents = function () {
            //  Buildfire.spinner.show();
            var successEvents = function (result) {
              //Buildfire.spinner.hide();
              //console.log("length",ContentHome.events.length)
              ContentHome.events = ContentHome.events.length ? ContentHome.events.concat(result) : result;
              searchOptions.skip = searchOptions.skip + PAGINATION.eventsCount;
              console.log("result",ContentHome.events)
              if (result.length == PAGINATION.eventsCount) {
                ContentHome.busy = false;
              }

            }, errorEvents = function () {
              //  Buildfire.spinner.hide();
              console.log("Error fetching events");
            };

            DataStore.search(searchOptions, TAG_NAMES.EVENTS_MANUAL).then(successEvents, errorEvents);
          };
          ContentHome.loadMore = function () {
            console.log("end page",ContentHome.busy)
           if (ContentHome.busy) return;
            ContentHome.busy = true;
            getManualEvents();
          };
      }]);
})(window.angular);
