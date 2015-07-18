'use strict';

angular.module('services', []).

factory('$api',  ['$q', '$config', '$rootScope', function ($q, $config, $rootScope) {

	var deferred = $q.defer();;
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
	    	$rootScope.user = {emial:authResult.email};
        	gapi.load('client', {'callback': clientReady});
	    } 
	    else {
	        deferred.reject('authentication error');
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
        if (gapi.client.c4c) {
        	_api = gapi.client.c4c;

        	// get organisation
			_api.user.getByEmail({email:$rootScope.user.email}).execute(function(resp){
				$rootScope.user = resp.items[0];
				$rootScope.organisation = $rootScope.user.organisation;
	            deferred.resolve(_api);
			});        	
        } 
        else {
            deferred.reject('api load error');
        }
    }     
    
    return {
    	load : function() {
    		
    		if(_api) {
	            deferred.resolve(_api);
    		}
    		else {
	    	    gapi.load('auth', {'callback': checkAuth});
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