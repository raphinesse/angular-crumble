# crumble

*A highly customizable breadcrumb service for AngularJS with ngRoute. Gets you back home the way __you__ want.*

While other breadcrumb services for ngRoute make many assumptions about your application, crumble provides sensible defaults but also provides you with the means to customize every detail of the service.


## Quick start

Install crumble using [Bower]. Have [ngRoute] up and running.
~~~
bower install angular-crumble --save
~~~
crumble can also be used with [npm] and [Browserify]. It follows the conventions described in this [npm blog post].

Add breadcrumb labels. With [interpolation][$interpolate].
~~~js
$routeProvider.when('/', {
  label: 'Hello {{name}}!',
  // controller, template, ...
})
~~~

Generate the breadcrumbs for the current path using the given context for interpolation.
~~~js
crumble.update({
  name: 'crumble'
});
~~~

Output the breadcrumbs.
~~~html
<a ng-repeat="bc in crumble.trail" ng-href="#{{bc.path}}">
  {{bc.label}}
</a>
~~~

Also check out how you can **[customize crumble](#customization)** to make it fit your needs.


## Setup

Install crumble using [Bower]. Have [ngRoute] up and running.
~~~
bower install angular-crumble --save
~~~

Include `crumble.js` in your HTML if you don't use [wiredep] or something similar.

~~~html
<script src="bower_components/angular-crumble/crumble.js"></script>
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

To render the breadcrumbs, attach crumble to your main controller's scope and put something like the code below in the corresponding template.

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

We interpret your application as a rooted tree. Each view is a node that either has a parent or is the root of the tree. Each node is identified by it's path. The parent of a node with path `path` is defined by the result of a call to `crumble.getParent(path)`. If the return value is falsy, the node is considered as the root.

*"What do I care?"*, you say? Well, by default the root is `/` and the parent is determined by simply dropping the last path segment of the current node (`/parent/child`). But you can completely customize this behavior by replacing `crumble.getParent` with your own implementation. Just take care that you don't create any cycles.

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

For reference, the standard implementation looks like this:

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


## Contributing

This repository uses the [Node.js Style Guide][nsg]. Contributions have to follow it too. You can use [JSHint][jsh] and [JSCS][jscs] to check your code for style guide conformance. Please use aptly named topic branches for pull requests.


## License

Copyright (c) 2014 Raphael von der Grün. Licensed under the MIT License.


[Bower]:          http://bower.io/
[wiredep]:        https://github.com/taptapship/wiredep
[ngRoute]:        https://docs.angularjs.org/api/ngRoute
[$interpolate]:   https://docs.angularjs.org/api/ng/service/$interpolate
[nsg]:            https://github.com/felixge/node-style-guide
[jsh]:            http://jshint.com/
[jscs]:           http://jscs.info/
[npm]:            https://www.npmjs.com/
[Browserify]:     http://browserify.org/
[npm blog post]:  http://blog.npmjs.org/post/114584444410
