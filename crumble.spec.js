(function() {
  'use strict';

  describe('crumble service', function() {

    // Load crumble module
    beforeEach(module('crumble'));

    it('should be defined', inject(function(crumble) {
      expect(crumble).toBeDefined();
    }));

    describe('getParent method', function() {
      it('should remove last segment of path', inject(function(crumble) {
        var path = 'test/parent/path/';
        var pathParent = crumble.getParent(path);
        expect(pathParent).toEqual('test/parent/');
      }));

      it('should throw an error when no path is given', inject(function(crumble) {
        expect(crumble.getParent).toThrowErrorOfType('Error');
      }));
    });

    describe('getRoute method', function() {
      var TEST_PATH, TEST_TEMPLATE;

      beforeEach(function () {
        TEST_PATH = '/parent/test';
        TEST_TEMPLATE = 'test template';
        angular.module('crumble').config(function($routeProvider) {
          $routeProvider.when(TEST_PATH, {template: TEST_TEMPLATE});
        });
      });

      it('should return correct route for path', inject(function(crumble) {
        var route = crumble.getRoute(TEST_PATH);
        expect(route.template).toBe(TEST_TEMPLATE);
      }));

      it('should ignore trailing slashes in path', inject(function(crumble) {
        var route = crumble.getRoute(TEST_PATH + '/');
        expect(route.template).toBe(TEST_TEMPLATE);
      }));
    });

    describe('getCrumb method', function() {

      // Mock angular's $interpolate service
      beforeEach(module(function($provide) {
        $provide.value('$interpolate', function(text) {
          return function (context) {
            return [text, context];
          };
        });
      }));

      it('should return interpolated path and label for given path',
        inject(function($interpolate, crumble) {
          var path = '/parent/test';
          var route = { label: 'Test' };
          spyOn(crumble, 'getRoute').and.returnValue(route);

          var crumb = crumble.getCrumb(path);
          expect(crumb).toEqual({
            path: $interpolate(path)(crumble.context),
            label: $interpolate(route.label)(crumble.context),
          });
        })
      );

      it('should throw when there is no route for given path',
        inject(expectErrorForRoute(undefined))
      );

      it('should throw when the route for given path has no label',
        inject(expectErrorForRoute({}))
      );

      function expectErrorForRoute(route) {
        return function(crumble) {
          var path = '/some/path';
          spyOn(crumble, 'getRoute').and.returnValue(route);

          expect(function() {
            crumble.getCrumb(path);
          }).toThrowErrorOfType('Error');
          expect(crumble.getRoute).toHaveBeenCalledWith(path);
        };
      }
    });

    describe('update method', function() {

      // Mock angular's location service
      beforeEach(module(function($provide) {
        $provide.value('$location', {path: jasmine.createSpy()});
      }));

      it('should default to an empty context when none is given',
        inject(function(crumble) {
          crumble.update();
          expect(crumble.context).toBeEmptyObject();
        })
      );

      it('should use the context passed in as an argument',
        inject(function(crumble) {
          var context = {test: 'foobar'};
          crumble.update(context);
          expect(crumble.context).toEqual(context);
        })
      );

      it('should correctly calculate the trail from root to the current path',
        inject(function($location, crumble) {
          $location.path.and.returnValue('/parent/test');
          spyOn(crumble, 'getCrumb').and.callFake(function(path) {
            // Treat /path and /path/ as equal
            return path.replace(/(.)\/$/, '$1');
          });

          crumble.update();
          expect(crumble.trail).toEqual([
            crumble.getCrumb('/'),
            crumble.getCrumb('/parent'),
            crumble.getCrumb('/parent/test'),
          ]);
        })
      );
    });
  });
})();
