!function() {
  'use strict';

  angular.module('crumble', ['ngRoute'])
    .factory('crumble', function ($location, $route, $interpolate) {
      var context;
      var crumble = {
        trail: [],
      };

      crumble.setContext = function (ctx) {
        context = ctx;
        crumble.trail = build($location.path());
      };

      var build = function (path) {
        return !path ? [] : build(crumble.getParent(path)).concat(crumble.getCrumb(path));
      };

      crumble.getParent = function (path) {
        return path.replace(/[^\/]*\/?$/, '');
      };

      crumble.getCrumb = function (path) {
        var route = crumble.getRoute(path);
        return {
          path: path,
          label: $interpolate(route.label)(context),
        };
      };

      crumble.getRoute = function (path) {
        return find($route.routes, function (route) {
          return route.regexp && route.regexp.test(path);
        });
      };

      var find = function (obj, fn, thisArg) {
        for (var key in obj) {
          if (obj.hasOwnProperty(key) && fn.call(thisArg, obj[key], key, obj)) {
            return obj[key];
          }
        }
      };

      return crumble;
    });

}();
