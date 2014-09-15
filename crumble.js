!function() {
  'use strict';

  angular.module('crumble', ['ngRoute'])
    .factory('crumble', function ($location, $route, $interpolate) {
      var crumble = {
        trail: [],
        context: {},
      };

      crumble.update = function (context) {
        crumble.context = context || crumble.context;
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
          label: $interpolate(route.label)(crumble.context),
        };
      };

      crumble.getRoute = function (path) {
        var route = find($route.routes, function (route) {
          return route.regexp && route.regexp.test(path);
        });
        return route.redirectTo ? $route.routes[route.redirectTo] : route;
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
