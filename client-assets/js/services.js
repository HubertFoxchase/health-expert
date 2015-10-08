'use strict';

angular.module('services', []).

factory('$api',  ['$q', '$config', '$rootScope', function ($q, $config, $rootScope) {

	var deferred = $q.defer();
	var _api = null;
	
    var clientId = $config.clientId,
        scopes = $config.scope;
    
	var checkAuth = function() {
	    gapi.auth.authorize({ 
	    	client_id: clientId, 
	    	scope: scopes, 
	    	immediate: true
	    }, 
	    handleAuthResult );
	};
	
	var handleAuthResult = function(authResult) {
	    if (authResult && !authResult.error) {
        	gapi.load('client', {'callback': clientReady});
	    } 
	    else {
	        deferred.reject('authentication error');
	        $rootScope.requireAuth = true;
	    }
	};    
	
	var clientReady = function() {
		var protocol = "https://"; 
		
		if (location.host.indexOf("localhost") > -1)
			protocol = "http://"
		
    	var ROOT = protocol + location.host + '/_ah/api';
    	
    	gapi.client.load('c4c', 'v1', apiReady, ROOT);
    }      

    var apiReady = function() {

		console.log("API loaded: " + (Date.now() - start) + " ms");
    	
    	if (gapi.client.c4c) {
        	_api = gapi.client.c4c;
        	
        	// get user and organisation
			_api.user.me().execute(function(resp){
				
    			console.log("Me loaded: " + (Date.now() - start) + " ms");
				if(!resp.error) {
					$rootScope.user = resp;
					$rootScope.user.isAdmin = resp.type == 1 || resp.type == 3;
					$rootScope.organisation = $rootScope.user.organisation;

					try {
						$rootScope.organisation.settings = JSON.parse($rootScope.organisation.settings);
					}
					catch(e){
						$rootScope.organisation.settings = {};
					}
					
		        	_api.user.list({organisation_id:$rootScope.organisation.id}).execute(function(resp){
						
		    			console.log("Users loaded: " + (Date.now() - start) + " ms");
		        		if(!resp.error) {
							$rootScope.doctors = resp.items;
							
							deferred.resolve(_api);
						}
						else {
				            deferred.reject({code:resp.error.code, message:resp.error.message});
						}
		        	});
				}
				else {
		            deferred.reject({code:resp.error.code, message:resp.error.message});
				}
			});        	
        } 
        else {
            deferred.reject({code:500, message:'Unspecified API load error'});
        }
    }      

    return {
    	load : function() {
    		if(_api) {
	            deferred.resolve(_api);
    		}
    		else {
	    	    //gapi.load('auth', {'callback': checkAuth});
	        	
    			console.log("Started loading API: " + (Date.now() - start) + " ms");

	        	gapi.load('client', {'callback': clientReady});
	            return deferred.promise;
    		}
    	},
    	
    	handleAuthClick : function (event) {
    	    gapi.auth.authorize({ 
    	    	client_id: clientId, 
    	    	scope: scopes, 
    	    	immediate: false
    	    }, 
    	    handleAuthResult );
    	    
    	    deferred = $q.defer();
    	    return deferred.promise;
    	},
    	
    	
    	get : function(){
    		return _api;
    	}
    };
}]);