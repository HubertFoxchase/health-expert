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
}])

.factory('$observations',  ['$http', '$config', function ($http, $config) {

	var _db = null;
	var _children = [];
	var _parent_id = null;
	var _sections = ["location", "duration", "character", "base", "exacerbating_factor"];

	$http.get($config.observationsJson).success(function(data) {
	    _db = data;
	});
	
	var findChildren = function(parent_id){
		var item = null;
		var a = [];
		
		for(var j=0;j<_db.length;j++){
			item = _db[j];
			if(item.id == parent_id){
				angular.forEach(_sections, function(value){
					if(item.children[value]){
						a.push.apply(a, item.children[value]); 
					}
				});
				return a.length > 0 ? a :  null;
			}
		}
		
		return null;
	}
	
    return {
    	getParent : function(id, speculatevly){
    		
    		console.log(Date.now() + " - looking for parent - " + id);
    		
    		if(speculatevly && angular.isArray(_children)){
    			for(var i=0;i<_children.length;i++){
    				if(_children[i] == id){
    		    		console.log(Date.now() + " - found speculatevly - " + _parent_id);
    					return _parent_id;
    				}    			
    			}    			
    		}
    		
    		if(angular.isArray(_db)){
    			for(var i=0;i<_db.length;i++){
    				if(_db[i].id == id){
    					
    					if(speculatevly && _db[i].parent_id){

        					console.log(Date.now() + " - save siblings for - " + _db[i].parent_id);

    						_parent_id = _db[i].parent_id;
    						_children = findChildren(_parent_id);
    					}
    					else {
    						_children = null;
    						_parent_id = null;
    					}

    					console.log(Date.now() + " - found normally - " + _db[i].parent_id);
  						return _db[i].parent_id ? _db[i].parent_id : null;
    				}
    			}
    		}
    		
    		return null;
    	},
    	
    };
}])


;