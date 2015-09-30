'use strict';

angular.module('c4c', ['ngMaterial', 'ngMdIcons', 'ngRoute', 'ngMessages', 'angularMoment', 'controllers', 'services', 'directives'])
.value('$config', {
      clientId     : '817202020074-1b97ag04r8rhfj6r40bocobupn92g5bj.apps.googleusercontent.com',
      scope        : [ 'https://www.googleapis.com/auth/userinfo.email' ],
      userRoles    : ["Doctor", "Nurse", "Reception", "Support", "Other"],
      observationsJson : "/dashboard-assets/js/observations.js",
      calendar : {
    	  officeOpenHour : 7,
    	  officeCloseHour : 19,
    	  appointmentDuration : 15,
    	  appointmentStep: 5,
    	  daysOpen : [1,2,3,4,5]
      },
      rtcServer : {
    	  httpUrl : "http://c4c-nibler.rhcloud.com:8000",
    	  httpsUrl : "https://c4c-nibler.rhcloud.com:8443"
      }
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
	    '500': '0091de',
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
        templateUrl: '/dashboard-assets/templates/sessionDetail.html',
        controller: 'SessionDetailCtrl',
        controllerAs: 'session',
		resolve : { init: ['$api', function($api) {
          	return $api.load();
	    	}]
		}
      })    
      .when('/grid', {
        templateUrl: '/dashboard-assets/templates/grid.html',
        controller: 'GridCtrl',
        controllerAs: 'grid',
		resolve : { init: ['$api', function($api) {
          	return $api.load();
	    	}]
		}
      })
      .when('/grid/:doctor', {
        templateUrl: '/dashboard-assets/templates/grid.html',
        controller: 'GridCtrl',
        controllerAs: 'grid',
		resolve : { init: ['$api', function($api) {
          	return $api.load();
	    	}]
		}
      })
      .when('/history', {
          templateUrl: '/dashboard-assets/templates/history.html',
          controller: 'HistoryCtrl',
          controllerAs: 'history',
  		  resolve : { init: ['$api', function($api) {
            	return $api.load();
  	    	}]
  		}
      })
      .when('/account', {
          templateUrl: '/dashboard-assets/templates/account.html',
          controller: 'AccountCtrl',
          controllerAs: 'account',
	  	  resolve : { init: ['$api', function($api) {
	            	return $api.load();
	  	    	}]
	  		}
      })
      .when('/invite-user', {
          templateUrl: '/dashboard-assets/templates/inviteUser.html',
          controller: 'InviteUserCtrl',
          controllerAs: 'inviteuser',
	  	  resolve : { init: ['$api', function($api) {
	            	return $api.load();
	  	    	}]
	  		}
      })
      .when('/settings', {
          templateUrl: '/dashboard-assets/templates/settings.html',
          controller: 'AccountCtrl',
          controllerAs: 'settings',
	  		resolve : { init: ['$api', function($api) {
	            	return $api.load();
	  	    	}]
	  		}
      })
      .when('/user/:id', {
          templateUrl: '/dashboard-assets/templates/userDetail.html',
          controller: 'UserDetailCtrl',
          controllerAs: 'userdetail',
	  		resolve : { init: ['$api', function($api) {
	            	return $api.load();
	  	    	}]
	  		}
      })
      .when('/patients', {
          templateUrl: '/dashboard-assets/templates/patients.html',
          controller: 'PatientsCtrl',
          controllerAs: 'patients',
	  		resolve : { init: ['$api', function($api) {
	            	return $api.load();
	  	    	}]
	  		}
      })
      .when('/patient/:id', {
          templateUrl: '/dashboard-assets/templates/patientDetail.html',
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
.run(["$rootScope", "$location", function ($rootScope, $location) {
	
		console.log("Run started: " + (Date.now() - start) + " ms");
    	
		$rootScope.$on('$routeChangeSuccess', function(){
    		ga('send', 'pageview', $location.path());
    	});
    	
    	$rootScope.$on('$routeChangeError', function(event, current, previous, error){
    		if(error.code == 401){
    			location.href = "/auth/login?url=" + encodeURI("/");
    		}
    	});
}]);