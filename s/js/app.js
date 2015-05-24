'use strict';

angular.module('c4c', ['ngMaterial', 'ngRoute', 'angularMoment', 'controllers', 'services'])
.value('config', {
      clientId     : '817202020074-1b97ag04r8rhfj6r40bocobupn92g5bj.apps.googleusercontent.com',
      scope        : [ 
                      'https://www.googleapis.com/auth/userinfo.email' 
                     ]
})
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
	 .when('/authorise', {
			templateUrl: 'templates/authorise.html',
			controller: 'GridCtrl',
	        controllerAs: 'grid'
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