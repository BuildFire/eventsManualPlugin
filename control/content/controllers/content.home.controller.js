'use strict';

(function (angular, buildfire) {
  angular
    .module('eventsManualPluginContent')
    .controller('ContentHomeCtrl', ['$scope', 'TAG_NAMES', 'STATUS_CODE', 'DataStore', 'LAYOUTS', '$sce', 'PAGINATION', 'Buildfire', '$modal','$rootScope',
      function ($scope, TAG_NAMES, STATUS_CODE, DataStore, LAYOUTS, $sce, PAGINATION, Buildfire, $modal, $rootScope) {
        var _data = {
          "content": {},
          "design": {
            "itemDetailsLayout": LAYOUTS.itemDetailsLayout[0].name,
            "itemDetailsBgImage": ""
          }
        };
        var searchOptions = {
          skip: 0,
          limit: PAGINATION.eventsCount, // the plus one is to check if there are any more
          sort: {"startDate": 1}
        };
        var regex;
        var ContentHome = this;

        //Scroll current view to top when page loaded.
        if (buildfire.navigation.scrollTop) {
          buildfire.navigation.scrollTop();
        }

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
        //ContentHome.data = angular.copy(_data);

        /*
         * create an artificial delay so api isnt called on every character entered
         * */
        var tmrDelay = null;

        var updateMasterItem = function (data) {
          ContentHome.masterData = angular.copy(data);
        };

        var isUnchanged = function (data) {
          return angular.equals(data, ContentHome.masterData);
        };

        ContentHome.partOfTime = function (format, paramTime) {
          return moment(new Date(paramTime)).format(format);
        };

        ContentHome.convertToZone = function (result) {
          /*for (var event = 0; event < result.length; event++) {
            ContentHome.completeDateStart = moment(new Date(result[event].data.startDate))
              .add(ContentHome.partOfTime('HH', result[event].data.startTime), 'hour')
              .add(ContentHome.partOfTime('mm', result[event].data.startTime), 'minute')
              .add(ContentHome.partOfTime('ss', result[event].data.startTime), 'second');
            ContentHome.completeDateEnd = moment(new Date(result[event].data.endDate))
              .add(ContentHome.partOfTime('HH', result[event].data.endTime), 'hour')
              .add(ContentHome.partOfTime('mm', result[event].data.endTime), 'minute')
              .add(ContentHome.partOfTime('ss', result[event].data.endTime), 'second');
            result[event].data.startDate = moment(ContentHome.completeDateStart).utcOffset(result[event].data.timeDisplay == 'SELECTED' && result[event].data.timezone["value"] ? result[event].data.timezone["value"] : ContentHome.getUTCZone()).format('MMM D, YYYY');
            result[event].data.endDate = moment(ContentHome.completeDateEnd).utcOffset(result[event].data.timeDisplay == 'SELECTED' && result[event].data.timezone["value"] ? result[event].data.timezone["value"] : ContentHome.getUTCZone()).format('MMM D, YYYY');
          }*/
        };

        ContentHome.getUTCZone = function () {
          //return moment(new Date()).utc().format("Z");
          return moment(new Date()).format("Z")
        };


        /*
         * Go pull any previously saved data
         * */
        var init = function () {
              var success = function (result) {

                  console.info('Init success result:', result);
                  ContentHome.data = result.data;
                  if (!ContentHome.data) {
                    ContentHome.data = angular.copy(_data);
                  } else {
                    if (!ContentHome.data.content)
                      ContentHome.data.content = {};
                  }
                  updateMasterItem(ContentHome.data);
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

        ContentHome.safeHtml = function (html) {
          if (html)
            return $sce.trustAsHtml(html);
        };

        ContentHome.searchEvents = function (search) {
          ContentHome.events = [];
          ContentHome.busy = false;
          searchOptions.skip = 0;
          if (search) {
            searchOptions.filter = {
              "$or": [{
                "$json.title": {
                  "$regex": search,
                  "$options": "i"
                }
              }]
            };
          }
          else {
            searchOptions.filter = {"$json.title": {"$regex": '/*'}};
          }
          ContentHome.loadMore();
        };

        ContentHome.removeEvent = function (eventId, index) {
          var status = function (result) {
              console.log(result)
            },
            err = function (err) {
              console.log(err)
            };
          if (buildfire.navigation.scrollTop) {
            buildfire.navigation.scrollTop();
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

        ContentHome.loadMore = function () {
          if (ContentHome.busy) return;
          ContentHome.busy = true;
          getManualEvents();
        };

        /*
         * ContentHome.showDeepLink to open a popup and show deeplink url so that user can copy it if needed
         * */
        ContentHome.showDeepLink = function (deepLink) {
          $modal.open({
            templateUrl: 'templates/modals/deep-link.html',
            controller: 'DeepLinkPopupCtrl',
            controllerAs: 'DeepLinkPopup',
            size: 'sm',
            resolve: {
              deepLink: function () {
                return deepLink;
              }
            }
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

        var getManualEvents = function () {
          Buildfire.spinner.show();
          var successEvents = function (result) {
               if (result.length || JSON.parse(localStorage.getItem("pluginLoadedFirst"))) {
            Buildfire.spinner.hide();
            ContentHome.convertToZone(result);
            ContentHome.events = ContentHome.events.length ? ContentHome.events.concat(result) : result;
            searchOptions.skip = searchOptions.skip + PAGINATION.eventsCount;
            if (result.length == PAGINATION.eventsCount) {
              ContentHome.busy = false;
            }
          }
          else
          {
;            ContentHome.dummyData = [{
              data: {
                address: {},
                addressTitle: "",
                carouselImages: [],
                dateCreated: 1451982804551,
                deepLinkUrl: "",
                description: "",
                endDate: 1461522600000,
                isAllDay: true,
                links: [],
                listImage: "",
                repeat: {},
                startDate: 1461522600000,
                timeDisplay: "",
                timezone: "",
                title: "Lorem Ipsum Event"
              }
            }]
            ContentHome.convertToZone(ContentHome.dummyData);
            ContentHome.events = ContentHome.dummyData
            searchOptions.skip = searchOptions.skip + PAGINATION.eventsCount;
          }
        } , errorEvents = function () {
            Buildfire.spinner.hide();
            console.log("Error fetching events");
          };
          DataStore.search(searchOptions, TAG_NAMES.EVENTS_MANUAL).then(successEvents, errorEvents);
        };

        // Send message to widget to return to list layout
        buildfire.messaging.sendMessageToWidget({type: 'Init'});

        init();

        updateMasterItem(_data);
          ContentHome.gotToHome = function () {
              $location.path('#/');
          };
        /*
         * watch for changes in data and trigger the saveDataWithDelay function on change
         * */
        $scope.$watch(function () {
          return ContentHome.data;
        }, saveDataWithDelay, true);

      }]);
})(window.angular, window.buildfire);
