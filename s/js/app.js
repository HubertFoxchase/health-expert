'use strict';

angular.module('c4c', ['ngMaterial', 'ngMdIcons', 'ngRoute', 'angularMoment', 'controllers', 'services', 'directives'])
.value('$config', {
      clientId     : '817202020074-1b97ag04r8rhfj6r40bocobupn92g5bj.apps.googleusercontent.com',
      scope        : [ 'https://www.googleapis.com/auth/userinfo.email' ],
      userRoles    : ["Doctor", "Nurse", "Reception", "Support", "Other"]
})
.constant('angularMomentConfig', {
    preprocess: 'utc', // optional
    timezone: 'Europe/London' // optional
})
.config(['$routeProvider', '$locationProvider',
  function($routeProvider, $locationProvider) {
    $routeProvider
      .when('/session/:id', {
        templateUrl: 'templates/sessionDetail.html',
        controller: 'SessionDetailCtrl',
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
      })
      .when('/history', {
          templateUrl: 'templates/history.html',
          controller: 'HistoryCtrl',
          controllerAs: 'history',
  		resolve : { init: ['$api', function($api) {
            	return $api.load();
  	    	}]
  		}
      })
      .when('/account', {
          templateUrl: 'templates/account.html',
          controller: 'AccountCtrl',
          controllerAs: 'account',
	  		resolve : { init: ['$api', function($api) {
	            	return $api.load();
	  	    	}]
	  		}
      })
      .when('/user/:id', {
          templateUrl: 'templates/userDetail.html',
          controller: 'UserDetailCtrl',
          controllerAs: 'userdetail',
	  		resolve : { init: ['$api', function($api) {
	            	return $api.load();
	  	    	}]
	  		}
      })
      .when('/patients', {
          templateUrl: 'templates/patients.html',
          controller: 'PatientsCtrl',
          controllerAs: 'patients',
	  		resolve : { init: ['$api', function($api) {
	            	return $api.load();
	  	    	}]
	  		}
      })
      .when('/patient/:id', {
          templateUrl: 'templates/patientDetail.html',
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
}]);