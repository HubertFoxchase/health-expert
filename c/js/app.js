'use strict';

angular.module('c4c', ['ngMaterial', 'ngRoute', 'controllers', 'services'])
.config(['$routeProvider', '$locationProvider',
function($routeProvider, $locationProvider) {
	$routeProvider
		.when('/start', {
			templateUrl: 'templates/start.html',
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
		.when('/:patient/symptom1', {
			templateUrl: 'templates/symptom1.html',
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