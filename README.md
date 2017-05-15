# crumble

*A highly customizable breadcrumb service for AngularJS 1.x with ngRoute. Gets you back home the way __you__ want.*

crumble allows you to generate dynamic breadcrumbs for your application.
It provides sensible defaults but also allows you to [customize](#customization) every detail of the service to match your app's structure.


## Setup

### Using a Module System

Install crumble using your favourite package manager
~~~
yarn add angular-crumble || npm i -S angular-crumble
~~~

Require `crumble` in your AngularJS module's dependencies
~~~js
angular.module('app', [require('angular-crumble')]);
~~~

crumble follows the conventions described in this [npm blog post].

### Using Plain Old Script Tags
Have [ngRoute] up and running.

Download crumble using [Bower] or just manually.
~~~
bower install angular-crumble --save
~~~

Load `crumble.js` from your HTML.

~~~html
<script src="path/to/crumble.js"></script>
~~~

Require `crumble` in your AngularJS module's dependencies

~~~js
angular.module('app', ['crumble']);
~~~


## Usage

### Set route labels

With the default configuration your only job here is to label your routes, so crumble knows what to display. Labels will be passed through [$interpolate]. See next section for how to set the interpolation context.

~~~js
angular.module('app')
  .config(function ($routeProvider) {

    $routeProvider
      .when('/', {
        templateUrl: 'views/home.html',
        controller: 'HomeCtrl',
        // The label can be a simple string...
        label: 'Home',
      })

      .when('/things/:thingId', {
        templateUrl: 'views/things/view.html',
        controller: 'ThingViewCtrl',
        // ...or markup as consumed by $interpolate
        label: '{{thing.title}}',
      })

      .otherwise({ redirectTo: '/' });
  });
~~~


### Update the breadcrumb trail

In the preceding section we saw that we can use [$interpolate markup][$interpolate] to create dynamic breadcrumb labels. But that also means we have to set an interpolation context.

~~~js
angular.module('app')
  .controller('ThingViewCtrl', function ($scope, $routeParams, crumble, things) {

    var thing = things.get($routeParams.thingId) || { title: 'Unknown Thing' };

    // Updates the breadcrumb trail with the given context
    crumble.update({thing: thing});

    // Instead you could also build up context in place before calling update
    crumble.context = {thing: thing};
    crumble.update();

  });
~~~

If you have a lot of static views without dedicated controllers, you might find  creating a controller just for calling `crumble.update()` quite cumbersome. So if you don't mind the little flash of incomplete breadcrumbs on your dynamic views, just setup your own auto updating.

~~~js
// In your application's run method
$rootScope.$on('$routeChangeSuccess', function() {
  crumble.update();
});
~~~

### Display the breadcrumb trail

To render the breadcrumbs, attach crumble to your view's scope and put something like the code below in the corresponding template.

~~~html
<ol>
  <li ng-repeat="bc in crumble.trail">
    <a ng-href="#{{bc.path}}">{{bc.label}}</a>
  </li>
</ol>
~~~

Omit the hash mark in the link if you are using HTML5 mode.


## Customization

If you bore with me to this point then you probably want to know about crumble's promised customizability. Well, here we go!

### Customizing the parent relationship

We interpret your application as a rooted tree. Each view is a node that either has a parent or is the root of the tree. Each node is identified by its path. The parent of a node with path `path` is defined by the result of a call to `crumble.getParent(path)`. If the return value is falsy, the node is considered as the root.

*"What do I care?"*, you say? Well, by default the root is `/` and the parent is determined by simply dropping the last path segment of the current node (e.g. `/` is the parent of `/foo` which is the parent of `/foo/bar`). But you can completely customize this behavior by replacing `crumble.getParent` with your own implementation. Just take care that you don't create any cycles.

Here's an example on how to configure crumble so that you can override standard parents by adding a `parent` property to a route

~~~js
// Put this in your run method
var getParent = crumble.getParent;
crumble.getParent = function (path) {
  var route = crumble.getRoute(path);
  return route && angular.isDefined(route.parent) ? route.parent : getParent(path);
};
~~~

### Customizing the breadcrumb objects

The entries in `crumble.trail` are the results of calling `crumble.getCrumb` for each node, passing that node's path as an argument. So again, if you want to add custom properties to the breadcrumbs (think `title` attributes and stuff), just override that function.

Simplified, the standard implementation looks like this:

~~~js
crumble.getCrumb = function (path) {
  // You can use that function for your own implementations too
  // It returns the matching route object for a given path
  var route = crumble.getRoute(path);
  return {
    path: $interpolate(path)(crumble.context),
    label: $interpolate(route.label)(crumble.context),
  };
};
~~~

## Running tests

~~~
npm install
npm test
~~~

Check _coverage/_ directory created after running the tests to see code coverage.


## Contributing

This repository uses the [Node.js Style Guide][nsg]. Contributions have to follow it too. You can use `npm run lint` to check your code for style guide conformance. Please use aptly named topic branches for pull requests.


## License

Copyright (c) 2014–2017 Raphael von der Grün. Licensed under the MIT License.


[Bower]:          http://bower.io/
[ngRoute]:        https://docs.angularjs.org/api/ngRoute
[$interpolate]:   https://docs.angularjs.org/api/ng/service/$interpolate
[nsg]:            https://github.com/felixge/node-style-guide
[npm]:            https://www.npmjs.com/
[npm blog post]:  http://blog.npmjs.org/post/114584444410
