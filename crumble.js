!function() {
  'use strict';

  function bakery($location, $route, $interpolate) {
    var crumble = {
      trail: [],
      context: {},
    };

    crumble.update = function(context) {
      crumble.context = context || crumble.context;
      crumble.trail = build($location.path());
    };

    crumble.getParent = function(path) {
      return path.replace(/[^\/]*\/?$/, '');
    };

    crumble.getCrumb = function(path) {
      var route = crumble.getRoute(path);
      if (!route) {
        throw new Error(
          'Could not find matching route for path ' + JSON.stringify(path)
        );
      }
      return {
        path: $interpolate(path)(crumble.context),
        label: $interpolate(route.label)(crumble.context),
      };
    };

    crumble.getRoute = function(path) {
      var route = find($route.routes, function(route) {
        return route.regexp && route.regexp.test(path);
      });
      return (route && route.redirectTo)
        ? $route.routes[route.redirectTo]
        : route;
    };

    function build(path) {
      return path
        ? build(crumble.getParent(path)).concat(crumble.getCrumb(path))
        : [];
    }

    function find(obj, fn, thisArg) {
      for (var key in obj) {
        if (obj.hasOwnProperty(key) && fn.call(thisArg, obj[key], key, obj)) {
          return obj[key];
        }
      }
    }

    return crumble;
  }

  angular
    .module('crumble', ['ngRoute'])
    .factory('crumble', ['$location', '$route', '$interpolate', bakery]);

}();
