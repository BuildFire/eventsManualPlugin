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

    describe('Unit : eventsManualPluginWidget  services', function () {
        describe('Unit: Buildfire Provider', function () {
            var Buildfire;
            var SocialDataStore;
            var Location;
            var EventCache;
            beforeEach(module('eventsManualPluginWidget'));

            beforeEach(inject(function (_Buildfire_,DataStore,_Location_,_EventCache_) {
                Buildfire = _Buildfire_;
                SocialDataStore = DataStore;
                Location=_Location_;
                EventCache=_EventCache_;
            }));

            it('Buildfire should exist and be an object', function () {
                expect(typeof Buildfire).toEqual('object');
            });

            it('EventCache should exist and be an object', function () {
                expect(typeof EventCache).toEqual('object');
            });


            it('EventCache.setCache should be a function', function () {
                console.info(">>>>>>>>>>",EventCache.setCache);
                expect(typeof EventCache.setCache).toEqual('function');
            });


            it('EventCache.setCache should be called', function () {
                console.info(">>>>>>>>>>",EventCache.setCache);
               EventCache.setCache({});
            });


            it('EventCache.getCache should be a function', function () {
                console.info(">>>>>>>>>>",EventCache.getCache);
                expect(typeof EventCache.getCache).toEqual('function');
            });

            it('EventCache.getCache should be called', function () {
                console.info(">>>>>>>>>>",EventCache.getCache);
                EventCache.getCache();
            });

            it('Location should exist and be an object', function () {
                expect(typeof Location).toEqual('object');
            });


            it('Location.go should be a function', function () {
                console.info(">>>>>>>>>>",Location.goTo);
                expect(typeof Location.goTo).toEqual('function');
            });

            it('Location.goTo called', function () {
                console.info("Location.goTo Called ???????????????");
                Location.goTo('#!@!');

            });
            it('Location.goToHome should be a function', function () {
                console.info(">>>>>>>>>>",Location.go);
                expect(typeof Location.goToHome).toEqual('function');
            });

            xit('Location.goToHome called', function () {
                console.info("Location.go Called ???????????????");
                Location.goToHome();
            });


            it('SocialDataStore should exist and be an object', function () {
                console.info(">>>>>>>>>>",SocialDataStore.addApplication);
                expect(typeof SocialDataStore.get).toEqual('function');
            });

            it('SocialDataStor get called', function () {
                console.info("SocialDataStor.addApplication Called ???????????????");
                SocialDataStore.get('_comment');

            });

            it('SocialDataStor getById called', function () {
                console.info("SocialDataStor.getById Called ???????????????");
                SocialDataStore.getById('123','sas12')

            });

            it('SocialDataStor insert called', function () {
                console.info("SocialDataStor getPosts Called ???????????????");
                SocialDataStore.insert  ([],'_comment');

            });

            it('SocialDataStor update called', function () {
                console.info("SocialDataStor update Called ???????????????");
                SocialDataStore.update('asasa',[],'_comment');

            });
            it('SocialDataStor save called', function () {
                console.info("SocialDataStor save Called ???????????????");
                SocialDataStore.save([], '_comment');

            });

            it('SocialDataStor onUpdate called', function () {
                console.info("SocialDataStor onUpdate Called ???????????????");
                SocialDataStore.onUpdate();

            });

            it('SocialDataStor banUser called', function () {
                console.info("SocialDataStor banUser Called ???????????????");
                SocialDataStore.search('121wasa', '_comment');

            });
            it('SocialDataStor clearListener called', function () {
                console.info("SocialDataStor clearListener Called ???????????????");
                SocialDataStore.clearListener();

            });

        });


    });



});