describe('Unit: eventsManualPluginWidget: Services', function () {
    beforeEach(module('eventsManualPluginWidget'));


    describe('Unit : Buildfire service', function () {
        var Buildfire;
        beforeEach(inject(
            function (_Buildfire_) {
                Buildfire = _Buildfire_;
            }));
        it('Buildfire should exists', function () {
            expect(Buildfire).toBeDefined();
        });
    });

    describe('Unit : DataStore Factory', function () {
        var DataStore, Buildfire, STATUS_MESSAGES, STATUS_CODE, q,$rootScope;
        beforeEach(module('eventsManualPluginContent', function ($provide) {
            $provide.service('Buildfire', function () {
                this.datastore = jasmine.createSpyObj('datastore', ['get', 'save']);
                this.datastore.get.and.callFake(function (_tagName, callback) {
                    if (_tagName) {
                        callback(null, 'Success');
                    } else {
                        callback('Error', null);
                    }
                });

                this.datastore.save.and.callFake(function (_item, _tagName, callback) {
                    if (!_item || !typeof callback === 'function') {
                        callback('Error', null);
                    } else {
                        callback(null, 'Success');
                    }
                });
            });
        }));
        beforeEach(inject(function (_$rootScope_,_DataStore_, _STATUS_CODE_, _STATUS_MESSAGES_, _Buildfire_) {
            $rootScope=_$rootScope_;
            DataStore = _DataStore_;
            STATUS_CODE = _STATUS_CODE_;
            STATUS_MESSAGES = _STATUS_MESSAGES_;
            Buildfire = _Buildfire_;


        }));
        it('DataStore should exist and be an object', function () {
            expect(typeof DataStore).toEqual('object');
        });
        it('DataStore.get should exist and be a function', function () {
            expect(typeof DataStore.get).toEqual('function');
        });
        it('DataStore.getById should exist and be a function', function () {
            expect(typeof DataStore.getById).toEqual('function');
        });
        it('DataStore.insert should exist and be a function', function () {
            expect(typeof DataStore.insert).toEqual('function');
        });
        it('DataStore.update should exist and be a function', function () {
            expect(typeof DataStore.update).toEqual('function');
        });
        it('DataStore.save should exist and be a function', function () {
            expect(typeof DataStore.save).toEqual('function');
        });
        it('DataStore.get should return error', function () {
            var result = ''
                , success = function (response) {
                    result = response;
                }
                , error = function (err) {
                    result = err;
                };
            DataStore.get(null).then(success, error);
            $rootScope.$digest();
            expect(result).toEqual('Error');
        });
        it('DataStore.get should return success', function () {
            var result = ''
                , success = function (response) {
                    result = response;
                }
                , error = function (err) {
                    result = err;
                };
            DataStore.get('Events_Manual_Info').then(success, error);
            $rootScope.$digest();
            expect(result).toEqual('Success');
        });

    })

});