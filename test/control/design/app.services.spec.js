describe('Unit : eventsManualPlugin design services', function () {
  describe('Unit: Buildfire Provider', function () {
    var Buildfire;
    beforeEach(module('eventsManualPluginDesign'));

    beforeEach(inject(function (_Buildfire_) {
      Buildfire = _Buildfire_;

    }));
    it('Buildfire should exist and be an object', function () {
      console.log(Buildfire)
      expect(typeof Buildfire).toEqual('object');
    });
  });

  describe('Unit : DataStore Factory', function () {
    var DataStore, Buildfire, STATUS_MESSAGES, STATUS_CODE, q;
    beforeEach(module('eventsManualPluginDesign'));
    beforeEach(inject(function (_DataStore_, _STATUS_CODE_, _STATUS_MESSAGES_) {
      DataStore = _DataStore_;
      STATUS_CODE = _STATUS_CODE_;
      STATUS_MESSAGES = _STATUS_MESSAGES_;
      Buildfire = {
        datastore: {}
      };
      Buildfire.datastore = jasmine.createSpyObj('Buildfire.datastore', ['get','getById','insert','update', 'save', 'deleteById']);
      Buildfire.datastore.get();
      Buildfire.datastore.getById();
      Buildfire.datastore.insert();
      Buildfire.datastore.update();
      Buildfire.datastore.save();
      Buildfire.datastore.deleteById();

    }));
  });

});

