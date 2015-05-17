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
.value(
		'groupsOfSymptoms', 
		[
			 {
				 name : 'Fever, weakness, feeling unwell',
				 symptoms : 
					 [
					  	{
					  		name : 'Fever',
					  		id : 's_98'
					  	},
					  	{
					  		name : 'Shortness of breath',
					  		id : 's_88'
					  	}
				     ]
			 },
			 {
				 name : 'Pain or discomfort',
				 symptoms : 
					 [
					  	{
					  		name : 'Headache',
					  		id : 's_21'
					  	},
					  	{
					  		name : 'Earache',
					  		id : 's_47'
					  	},
					  	{
					  		name : 'Abdominal pain',
					  		id : 's_13'
					  	},
					  	{
					  		name : 'Chest pain',
					  		id : 's_50'
					  	},
					  	{
					  		name : 'Joint pain',
					  		id : 's_44'
					  	}
				     ]
			 },
			 {
				 name : 'Respiratory problems',
				 symptoms : 
					 [
					  	{
					  		name : 'Cough',
					  		id : 's_102'
					  	},
					  	{
					  		name : 'Sore throat',
					  		id : 's_20'
					  	},
					  	{
					  		name : 'Blocked nose',
					  		id : 's_331'
					  	}				     
					 ]
			 },
			 {
				 name : 'Skin problems',
				 symptoms : 
					 [
					  	{
					  		name : 'Red skin',
					  		id : 's_229'
					  	}
				     ]
			 },
			 {
				 name : 'Pshycological problems',
				 symptoms : 
					 [
					  	{
					  		name : 'Anxiety',
					  		id : 's_120'
					  	}
				     ]
			 },
			 {
				 name : 'Other',
				 symptoms : []
			 }
		]


)