'use strict';

angular.module('c4c', ['ngMaterial', 'ngMdIcons', 'ngRoute', 'angularMoment', 'controllers', 'services', 'directives'])
.value('config', {
      clientId     : '817202020074-1b97ag04r8rhfj6r40bocobupn92g5bj.apps.googleusercontent.com',
      scope        : [ 'https://www.googleapis.com/auth/userinfo.email' ]
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
        controllerAs: 'session',
		resolve : { init: ['$api', function($api) {
          	return $api.load();
	    	}]
		}
      })
	 .when('/authorise', {
			templateUrl: 'templates/authorise.html',
			controller: 'GridCtrl',
	        controllerAs: 'grid'
	  })      
      .when('/grid', {
        templateUrl: 'templates/grid.html',
        controller: 'GridCtrl',
        controllerAs: 'grid',
		resolve : { init: ['$api', function($api) {
          	return $api.load();
	    	}]
		}
      }).
	  otherwise({
	          redirectTo: '/grid'
	  });

    //$locationProvider.html5Mode({enabled: true,requireBase:false});
}])
.run(["$rootScope", "$location", 
      function ($rootScope, $location) {
    	$rootScope.$on('$routeChangeSuccess', function(){
    		ga('send', 'pageview', $location.path());
    });
}]);