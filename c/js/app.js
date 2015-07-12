'use strict';

angular.module('c4c', ['ngMaterial', 'ngRoute', 'controllers', 'services', 'values'])
.value('config', {
      clientId     : '817202020074-1b97ag04r8rhfj6r40bocobupn92g5bj.apps.googleusercontent.com',
      scope        : [ 
                      'https://www.googleapis.com/auth/userinfo.email' 
                     ]
})
.config(['$routeProvider', '$locationProvider',
function($routeProvider, $locationProvider) {
	$routeProvider
		.when('/start', {
			templateUrl: 'templates/start.html',
			controller: 'StartCtrl',
			resolve : { init: ['$api', function($api) {
		          	return $api.load();
	        	}]
			}
		})
		.when('/authorise', {
			templateUrl: 'templates/authorise.html',
			controller: 'StartCtrl',
			resolve : { init: ['$api', function($api) {
	          	return $api.load();
	        	}]
			}
		})
		.when('/:patient/intro', {
			templateUrl: 'templates/intro.html',
			controller: 'StartCtrl',
			resolve : { init: ['$api', function($api) {
	          	return $api.load();
	        	}]
			}
		})
		.when('/:patient/gender', {
			templateUrl: 'templates/gender.html',
			controller: 'StartCtrl',
			resolve : { init: ['$api', function($api) {
	          	return $api.load();
	        	}]
			}
		})
		.when('/:patient/age', {
			templateUrl: 'templates/age.html',
			controller: 'StartCtrl',
			resolve : { init: ['$api', function($api) {
	          	return $api.load();
	        	}]
			}
		})
		.when('/:patient/reason', {
			templateUrl: 'templates/reason.html',
			controller: 'StartCtrl',
			resolve : { init: ['$api', function($api) {
	          	return $api.load();
	        	}]
			}
		})		
		.when('/:patient/groups', {
			templateUrl: 'templates/symptom1.html',
			controller: 'StartCtrl',
			resolve : { init: ['$api', function($api) {
	          	return $api.load();
	        	}]
			}
		})
		.when('/:patient/initial/:groupId', {
			templateUrl: 'templates/symptom2.html',
			controller: 'StartCtrl',
			resolve : { init: ['$api', function($api) {
	          	return $api.load();
	        	}]
			}
		})	
		.when('/:session/end', {
			templateUrl: 'templates/end.html',
			controller: 'QuestionsCtrl',
			resolve : { init: ['$api', function($api) {
	          	return $api.load();
	        	}]
			}
		})
		.when('/:session/symptom/:sid', {
			templateUrl: 'templates/question.html',
			controller: 'QuestionsCtrl',
			resolve : { init: ['$api', function($api) {
	          	return $api.load();
	        	}]
			}
		})
		.when('/:session/symptom', {
			templateUrl: 'templates/question.html',
			controller: 'QuestionsCtrl',
			resolve : { init: ['$api', function($api) {
	          	return $api.load();
	        	}]
			}
		})
	    .otherwise({
	          redirectTo: '/start'
	    });		

    //$locationProvider.html5Mode({enabled: true,requireBase:false});
}])
.run(["$rootScope", "$location", 
      function ($rootScope, $location) {
    	$rootScope.$on('$routeChangeSuccess', function(){
    		ga('send', 'pageview', $location.path());
    });
}]);