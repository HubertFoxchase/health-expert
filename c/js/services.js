'use strict';

angular.module('services', []).

factory('$api', ['$q', function ($q) {

	var deferred = $q.defer();;
	var _api = null;
	
	var clientReady = function() {
		
    	//var ROOT = 'http://localhost:11080/_ah/api';
    	var ROOT = 'https://health-expert-1705.appspot.com/_ah/api';
    	gapi.client.load('c4c', 'v1', apiReady, ROOT);
    }      

    var apiReady = function() {
        if (gapi.client.c4c) {
        	_api = gapi.client.c4c;
            deferred.resolve(_api);
        } 
        else {
            deferred.reject('error');
        }
    }      
    
    return {
    	load : function() {

        	gapi.load('client', {'callback': clientReady});
            return deferred.promise;
    	},
    	
    	get : function(){
    		return _api;
    	}
    };
}]);