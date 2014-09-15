!function() {
  'use strict';

  angular.module('crumble', ['ngRoute'])
    .factory('crumble', function ($location, $route, $interpolate) {
      var context;
      var trail = [];
      var crumble = {
        getTrail: function () {
          return trail;
        },
      };

      crumble.setContext = function (ctx) {
        context = ctx;
        angular.copy(build($location.path(), trail));
      };

      var build = function (path) {
        return !path ? [] : build(crumble.getParent(path)).concat(crumble.getCrumb(path));
      };

      crumble.getParent = function (path) {
        return path.replace(/[^\/]*\/?$/, '');
      };

      crumble.getCrumb = function (path) {
        var route = find($route.routes, function (route) {
          return route.regexp.test(path);
        });
        return {
          path: path,
          label: $interpolate(route.label)(context),
        };
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
