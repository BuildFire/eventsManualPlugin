describe('Unit: eventsManualPluginWidget widget app', function () {

  describe('Unit: app routes', function () {
    beforeEach(module('eventsManualPluginWidget'));
    var location, route, rootScope;
    beforeEach(inject(function (_$location_, _$route_, _$rootScope_) {
      location = _$location_;
      route = _$route_;
      rootScope = _$rootScope_;
    }));

    describe('Home route', function () {
      beforeEach(inject(
        function ($httpBackend) {
          $httpBackend.expectGET('/')
            .respond(200);
          $httpBackend.expectGET('/')
            .respond(200);
        }));

      it('should load the home page on successful load of location path /', function () {
        location.path('/');
        rootScope.$digest();
        });
    });

    describe('Event route', function () {
      beforeEach(inject(
        function ($httpBackend) {
          $httpBackend.expectGET('templates/eventDetails.html')
            .respond(200);
          $httpBackend.expectGET('/event/:id')
            .respond(200);
        }));

      it('should load the event details page on successful load of location path /event/:id', function () {
        location.path('/event/123');
        rootScope.$digest();
        expect(route.current.controller).toBe('WidgetEventCtrl')
      });
    });
  });
  xdescribe('Unit: getImageUrl filter', function () {
    beforeEach(module('eventsManualPluginWidget'));
    var filter;
    beforeEach(inject(function (_$filter_) {
      filter = _$filter_;
    }));

    xit('it should pass if "getImageUrl" filter returns resized image url', function () {
      var result;
      result = filter('getImageUrl')('https://imagelibserver.s3.amazonaws.com/25935164-2add-11e5-9d04-02f7ca55c361/950a50c0-400a-11e5-9af5-3f5e0d725ccb.jpg', 88, 124, 'resize');
      expect(result).toEqual("http://s7obnu.cloudimage.io/s/resizenp/88x124/https://imagelibserver.s3.amazonaws.com/25935164-2add-11e5-9d04-02f7ca55c361/950a50c0-400a-11e5-9af5-3f5e0d725ccb.jpg");
    });
    xit('it should pass if "getImageUrl" filter returns cropped image url', function () {
      var result;
      result = filter('getImageUrl')('https://imagelibserver.s3.amazonaws.com/25935164-2add-11e5-9d04-02f7ca55c361/950a50c0-400a-11e5-9af5-3f5e0d725ccb.jpg', 88, 124, 'crop');
      expect(result).toEqual('http://s7obnu.cloudimage.io/s/crop/88x124/https://imagelibserver.s3.amazonaws.com/25935164-2add-11e5-9d04-02f7ca55c361/950a50c0-400a-11e5-9af5-3f5e0d725ccb.jpg');
    });
  });

  describe('Unit: getDate filter', function () {
    beforeEach(module('eventsManualPluginWidget'));
    var filter;
    beforeEach(inject(function (_$filter_) {
      filter = _$filter_;
    }));

    it('it should pass if "getDate" filter returns date from given timestamp', function () {
      var result;
      result = filter('getDate')(1444289669939);
      expect(result).toEqual(8);
    });
  });

  describe('Unit: getMonth filter', function () {
    beforeEach(module('eventsManualPluginWidget'));
    var filter;
    beforeEach(inject(function (_$filter_) {
      filter = _$filter_;
    }));

    it('it should pass if "getMonth" filter returns month from given timestamp', function () {
      var result;
      result = filter('getMonth')(1444289669939);
      expect(result).toEqual('OCT');
    });
  });


  describe('Unit: run()', function () {
    var Buildfire;
    beforeEach(module('eventsManualPluginWidget'));
    beforeEach(inject(function () {
      Buildfire = jasmine.createSpyObj('Buildfire', ['getContext']);
      Buildfire.messaging = jasmine.createSpyObj('messaging', ['onReceivedMessage', 'onUpdate']);
      Buildfire.navigation = jasmine.createSpyObj('navigation', ['onBackButtonClick', 'login']);
    }));

    it('it should call the run methods', function () {
      var msg={};
      msg.type='AddNewItem';
        Buildfire.messaging.onReceivedMessage(msg);
    });
  });


});