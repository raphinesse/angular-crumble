/// <reference types="@types/angular-route" />

declare module 'angular' {
  namespace route {
    interface IRoute {
      /**
       * Sets the label of your route, so crumble knows what to display.
       * Will be passed through {@link https://docs.angularjs.org/api/ng/service/$interpolate $interpolate}.
       *
       * @example
       * // The label can be a simple string...
       * label: 'Home',
       * // ...or markup as consumed by $interpolate
       * label: '{{thing.title}}',
       */
      label: string;
    }
  }
}
