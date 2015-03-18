'use strict';

angular.module('c4c', ['ngMaterial', 'ngRoute', 'angularMoment', 'controllers', 'services'])
.constant('angularMomentConfig', {
    preprocess: 'utc', // optional
    timezone: 'Europe/London' // optional
})
.config(['$routeProvider', '$locationProvider',
  function($routeProvider, $locationProvider) {
    $routeProvider
      .when('/session/:id', {
        templateUrl: 'templates/view.html',
        controller: 'SessionCtrl',
        controllerAs: 'session'
      })
      .when('/grid', {
        templateUrl: 'templates/grid.html',
        controller: 'GridCtrl',
        controllerAs: 'grid'
      }).
	  otherwise({
	          redirectTo: '/grid'
	  });

    //$locationProvider.html5Mode({enabled: true,requireBase:false});
}])