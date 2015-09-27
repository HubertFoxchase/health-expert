'use strict';

angular.module('c4c', ['ngMaterial', 'ngMdIcons', 'ngRoute', 'ngMessages', 'controllers', 'services', 'values', 'directives'])
.value('$config', {
      clientId     : '817202020074-1b97ag04r8rhfj6r40bocobupn92g5bj.apps.googleusercontent.com',
      scope        : [ 'https://www.googleapis.com/auth/userinfo.email' ],
      observationsJson : "/patient-assets/js/observations.js",
      rtcServer : {
    	  httpUrl : "http://c4c-nibler.rhcloud.com:8000",
    	  httpsUrl : "https://c4c-nibler.rhcloud.com:8443"
      }      
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
		.when('/list', {
			templateUrl: '/patient-assets/templates/patients-list.html',
			controller: 'PatientCtrl',
			resolve : { init: ['$api', function($api) {
		          	return $api.load();
	        	}]
			}
		})
		.when('/start', {
			templateUrl: '/patient-assets/templates/start.html',
			controller: 'StartCtrl',
			resolve : { init: ['$api', function($api) {
		          	return $api.load();
	        	}]
			}
		})
		.when('/:patient/intro', {
			templateUrl: '/patient-assets/templates/intro.html',
			controller: 'StartCtrl',
			resolve : { init: ['$api', function($api) {
	          	return $api.load();
	        	}]
			}
		})
		.when('/:patient/gender', {
			templateUrl: '/patient-assets/templates/gender.html',
			controller: 'StartCtrl',
			resolve : { init: ['$api', function($api) {
	          	return $api.load();
	        	}]
			}
		})
		.when('/:patient/age', {
			templateUrl: '/patient-assets/templates/age.html',
			controller: 'StartCtrl',
			resolve : { init: ['$api', function($api) {
	          	return $api.load();
	        	}]
			}
		})
		.when('/:patient/reason', {
			templateUrl: '/patient-assets/templates/reason.html',
			controller: 'StartCtrl',
			resolve : { init: ['$api', function($api) {
	          	return $api.load();
	        	}]
			}
		})		
		.when('/:patient/doctor-reason', {
			templateUrl: '/patient-assets/templates/doctor-reason.html',
			controller: 'StartCtrl',
			resolve : { init: ['$api', function($api) {
	          	return $api.load();
	        	}]
			}
		})	
		.when('/:patient/symptom-groups', {
			templateUrl: '/patient-assets/templates/symptom-groups.html',
			controller: 'StartCtrl',
			resolve : { init: ['$api', function($api) {
	          	return $api.load();
	        	}]
			}
		})
		.when('/:patient/initial/:groupId', {
			templateUrl: '/patient-assets/templates/symptom2.html',
			controller: 'StartCtrl',
			resolve : { init: ['$api', function($api) {
	          	return $api.load();
	        	}]
			}
		})	
		.when('/:session/end', {
			templateUrl: '/patient-assets/templates/end.html',
			controller: 'EndCtrl',
			resolve : { init: ['$api', function($api) {
	          	return $api.load();
	        	}]
			}
		})
		.when('/:caller/video-chat', {
			templateUrl: '/patient-assets/templates/video-chat.html',
			controller: 'VideoChatCtrl',
			resolve : { init: ['$api', function($api) {
	          	return $api.load();
	        	}]
			}
		})		
		.when('/:session/symptom/:sid', {
			templateUrl: '/patient-assets/templates/question.html',
			controller: 'QuestionsCtrl',
			resolve : { init: ['$api', function($api) {
	          	return $api.load();
	        	}]
			}
		})
		.when('/:session/symptom', {
			templateUrl: '/patient-assets/templates/question.html',
			controller: 'QuestionsCtrl',
			resolve : { init: ['$api', function($api) {
	          	return $api.load();
	        	}]
			}
		})		
	    .otherwise({
	          redirectTo: '/list'
	    });		

    //$locationProvider.html5Mode({enabled: true,requireBase:false});
}])
.run(["$rootScope", "$location", "$mdDialog", function ($rootScope, $location, $mdDialog) {
	
    	$rootScope.$on('$routeChangeSuccess', function(){
    		ga('send', 'pageview', $location.path());
    	});
    	
    	$rootScope.$on('$routeChangeError', function(event, current, previous, error){
    		if(error.code == 401){
    			location.href = "/auth/login?url=" + encodeURI("/patient");
    		}
    	});
    	
    	$rootScope.$on('$commsError', function(event, args){
    	    $mdDialog.show(
    	      $mdDialog.alert()
    	        //.parent(angular.element(document.querySelector('#popupContainer')))
    	        .clickOutsideToClose(true)
    	        .title(args ? args.title : 'Hmm... something went wrog here')
    	        .content(args ? args.description : 'No futher info.')
    	        .ariaLabel('Error Alert')
    	        .ok('OK')
    	        .targetEvent(event)
    	    );
    	});
    	
    	$rootScope.$on('$notImplemented', function(event, args){
    	    $mdDialog.show(
    	      $mdDialog.alert()
    	        .clickOutsideToClose(true)
    	        .title('Sorry, this feature has not been implemented yet ...')
    	        .content('... but we are working really hard to make it work!')
    	        .ariaLabel('Not Implemented')
    	        .ok('Close')
    	        .targetEvent(event)
    	    );
    	});    	
    	
		$rootScope.notImplemented = function(){
			$rootScope.$emit("$notImplemented", {});			
		}
    	
    	document.addEventListener("backbutton", function(){
    		if(location.hash.indexOf("/list") > 0 || location.hash.indexOf("/end") > 0) {
    			navigator.app.exitApp();
    		}
    		else if (location.hash.indexOf("/start") > 0){
    			return true;
    		}
    		else {
    			return false;
    		}
    	}, false);
}]);