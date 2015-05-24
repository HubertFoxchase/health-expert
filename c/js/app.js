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
			controller: 'StartCtrl'
		})
		.when('/authorise', {
			templateUrl: 'templates/authorise.html',
			controller: 'StartCtrl'
		})
		.when('/:patient/intro', {
			templateUrl: 'templates/intro.html',
			controller: 'StartCtrl'
		})
		.when('/:patient/gender', {
			templateUrl: 'templates/gender.html',
			controller: 'StartCtrl'
		})
		.when('/:patient/age', {
			templateUrl: 'templates/age.html',
			controller: 'StartCtrl'
		})
		.when('/:patient/reason', {
			templateUrl: 'templates/reason.html',
			controller: 'StartCtrl'
		})		
		.when('/:patient/groups', {
			templateUrl: 'templates/symptom1.html',
			controller: 'StartCtrl'
		})
		.when('/:patient/initial/:groupId', {
			templateUrl: 'templates/symptom2.html',
			controller: 'StartCtrl'
		})	
		.when('/:session/end', {
			templateUrl: 'templates/end.html',
			controller: 'QuestionsCtrl'
		})
		.when('/:session/symptom', {
			templateUrl: 'templates/question.html',
			controller: 'QuestionsCtrl'
		}).
	    otherwise({
	          redirectTo: '/start'
	    });		

    //$locationProvider.html5Mode({enabled: true,requireBase:false});
}])