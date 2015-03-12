'use strict';

angular.module('services', []).

service('$api', ['$q', function ($q) {

	var deferred;
	
    this.loadApi = function () {
    	gapi.load('client', {'callback': clientReady});
    	
    	deferred = $q.defer();
        return deferred.promise;
    }

    var clientReady = function() {
    	var ROOT = 'http://localhost:11080/_ah/api';
    	gapi.client.load('c4c', 'v1', apiReady, ROOT);
    }      
    
    var apiReady = function() {
        if (gapi.client.c4c) {
            deferred.resolve(gapi.client.c4c);
        } 
        else {
            deferred.reject('error');
        }
    }      
}]);