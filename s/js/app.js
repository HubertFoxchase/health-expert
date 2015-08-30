'use strict';

angular.module('c4c', ['ngMaterial', 'ngMdIcons', 'ngRoute', 'angularMoment', 'controllers', 'services', 'directives'])
.value('$config', {
      clientId     : '817202020074-1b97ag04r8rhfj6r40bocobupn92g5bj.apps.googleusercontent.com',
      scope        : [ 'https://www.googleapis.com/auth/userinfo.email' ],
      userRoles    : ["Doctor", "Nurse", "Reception", "Support", "Other"],
      observationsJson : "js/observations.js"
})
.constant('angularMomentConfig', {
    preprocess: 'utc', // optional
    timezone: 'Europe/London' // optional
})
.config(['$routeProvider', '$locationProvider', '$mdThemingProvider',
function($routeProvider, $locationProvider, $mdThemingProvider) {
	
	$mdThemingProvider.definePalette('c4cPalette', {
	    '50': 'ffebee',
	    '100': 'bbdefb',
	    '200': 'ef9a9a',
	    '300': 'e57373',
	    '400': 'ef5350',
	    '500': '2196f3',
	    '600': 'e53935',
	    '700': '1976d2',
	    '800': 'c62828',
	    '900': 'b71c1c',
	    'A100': 'ec407a',
	    'A200': 'c2185b',
	    'A400': '880e4f',
	    'A700': 'd50000',
	    'contrastDefaultColor': 'light',    // whether, by default, text (contrast)
	                                        // on this palette should be dark or light
	    'contrastDarkColors': ['50', '100', //hues which contrast should be 'dark' by default
	     '200', '300', '400', 'A100'],
	    'contrastLightColors': undefined    // could also specify this if default was 'dark'
	});
	
	$mdThemingProvider
		.theme('default')
		.primaryPalette('c4cPalette')
	    .accentPalette('c4cPalette');	
	
    $routeProvider
      .when('/session/:id', {
        templateUrl: '/s/templates/sessionDetail.html',
        controller: 'SessionDetailCtrl',
        controllerAs: 'session',
		resolve : { init: ['$api', function($api) {
          	return $api.load();
	    	}]
		}
      })
	 .when('/authorise', {
			templateUrl: '/s/templates/authorise.html',
			controller: 'GridCtrl',
	        controllerAs: 'grid'
	  })      
      .when('/grid', {
        templateUrl: '/s/templates/grid.html',
        controller: 'GridCtrl',
        controllerAs: 'grid',
		resolve : { init: ['$api', function($api) {
          	return $api.load();
	    	}]
		}
      })
      .when('/history', {
          templateUrl: '/s/templates/history.html',
          controller: 'HistoryCtrl',
          controllerAs: 'history',
  		  resolve : { init: ['$api', function($api) {
            	return $api.load();
  	    	}]
  		}
      })
      .when('/account', {
          templateUrl: '/s/templates/account.html',
          controller: 'AccountCtrl',
          controllerAs: 'account',
	  	  resolve : { init: ['$api', function($api) {
	            	return $api.load();
	  	    	}]
	  		}
      })
      .when('/settings', {
          templateUrl: '/s/templates/settings.html',
          controller: 'AccountCtrl',
          controllerAs: 'settings',
	  		resolve : { init: ['$api', function($api) {
	            	return $api.load();
	  	    	}]
	  		}
      })
      .when('/user/:id', {
          templateUrl: '/s/templates/userDetail.html',
          controller: 'UserDetailCtrl',
          controllerAs: 'userdetail',
	  		resolve : { init: ['$api', function($api) {
	            	return $api.load();
	  	    	}]
	  		}
      })
      .when('/patients', {
          templateUrl: '/s/templates/patients.html',
          controller: 'PatientsCtrl',
          controllerAs: 'patients',
	  		resolve : { init: ['$api', function($api) {
	            	return $api.load();
	  	    	}]
	  		}
      })
      .when('/patient/:id', {
          templateUrl: '/s/templates/patientDetail.html',
          controller: 'PatientDetailCtrl',
          controllerAs: 'patientdetail',
	  		resolve : { init: ['$api', function($api) {
	            	return $api.load();
	  	    	}]
	  		}
      })
      .otherwise({
	          redirectTo: '/grid'
	  });

    //$locationProvider.html5Mode({enabled: true,requireBase:false});
}])
.run(["$rootScope", "$location", 
    function ($rootScope, $location) {
    	$rootScope.$on('$routeChangeSuccess', function(){
    		ga('send', 'pageview', $location.path());
    });
    
    console.log(Date.now());
}]);