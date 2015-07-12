'use strict';

angular.module('services', []).

factory('$api',  ['$q', 'config', function ($q, config) {

	var deferred = $q.defer();;
	var _api = null;
	
    var clientId = config.clientId,
        scopes = config.scope;
    
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
            deferred.resolve(_api);
        } 
        else {
            deferred.reject('api load error');
        }
    }      
    
    return {
    	load : function() {
    	    gapi.load('auth', {'callback': checkAuth});

            return deferred.promise;
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