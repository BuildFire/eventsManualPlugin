describe('Unit : event Manual Plugin widget.home.controller.js', function () {
  var WidgetHome, scope, $rootScope, $controller, Buildfire, ActionItems, TAG_NAMES, STATUS_CODE, LAYOUTS, STATUS_MESSAGES, CONTENT_TYPE, q;
  beforeEach(module('eventsManualPluginWidget'));
  var editor;
  beforeEach(inject(function (_$rootScope_, _$q_, _$controller_, _TAG_NAMES_, _STATUS_CODE_, _LAYOUTS_, _STATUS_MESSAGES_) {
    $rootScope = _$rootScope_;
    q = _$q_;
    scope = $rootScope.$new();
    $controller = _$controller_;
    TAG_NAMES = _TAG_NAMES_;
    STATUS_CODE = _STATUS_CODE_;
    STATUS_MESSAGES = _STATUS_MESSAGES_;
    LAYOUTS = _LAYOUTS_;
    Buildfire = {
      components: {
        carousel: {
          editor: function (name) {
            return {}
          },
          viewer: function (name) {
            return {}
          }
        }
      },
      spinner: {
        show: function () {
        }
      }
    };
    ActionItems = jasmine.createSpyObj('ActionItems', ['showDialog']);
    Buildfire.components.carousel = jasmine.createSpyObj('Buildfire.components.carousel', ['editor', 'onAddItems']);

  }));

  beforeEach(function () {
    WidgetHome = $controller('WidgetHomeCtrl', {
      $scope: scope,
      $q: q,
      Buildfire: Buildfire,
      TAG_NAMES: TAG_NAMES,
      ActionItems: ActionItems,
      STATUS_CODE: STATUS_CODE,
      CONTENT_TYPE: CONTENT_TYPE,
      LAYOUTS: LAYOUTS
    });
  });

  describe('Units: units should be Defined', function () {
  });

  describe('$destroy', function () {
    it('should invoke when get $destroy', function () {
      $rootScope.$broadcast('$destroy');
    });
  });

  describe('Carousel:LOADED', function () {
    it('should invoke when get Carousel:LOADED', function () {
      $rootScope.$broadcast('Carousel:LOADED');
    });
    it('getEvent to get the events selected date onwards', function () {
      WidgetHome.clickEvent = true;
      WidgetHome.getEvent();
    });
  });
  describe('WidgetHome.getUTCZone', function () {
    it('should invoke when WidgetHome.getUTCZone is called', function () {
      WidgetHome.getUTCZone();
    });
  });
  describe('WidgetHome.partOfTime', function () {
    it('should invoke when WidgetHome.partOfTime is called', function () {
      var format='HH', paramTime = '2015-10-23T03:24:07.391Z0.9960675491020083'
      WidgetHome.partOfTime(format,paramTime);
    });
  });

  describe('WidgetHome.addEvents', function () {
    it('should invoke when WidgetHome.addEvents is called', function () {
      WidgetHome.addEvents({},0,{});
    });
  });

  describe('WidgetHome.loadMore', function () {
    it('should invoke when WidgetHome.loadMore is called', function () {
      WidgetHome.loadMore();
    });
  });

  describe('WidgetHome.openDetailsPage', function () {
    it('should invoke when WidgetHome.openDetailsPage is called', function () {
      WidgetHome.openDetailsPage({});
    });
  });

  describe('scope.getDayClass', function () {
    it('should invoke when scope.getDayClass is called', function () {
      WidgetHome.allEvents={};
      WidgetHome.allEvents.length=0;
     /* WidgetHome.allEvents={};
      WidgetHome.allEvents.length=12;
      WidgetHome.allEvents[0].data= null;
      WidgetHome.allEvents[0].data.startDate='12121';*/
      scope.getDayClass('1212112',{});
    });
  });
});