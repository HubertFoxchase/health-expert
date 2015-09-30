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
		
		$rootScope.loadingProgress += 1; 
		
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
							$rootScope.doctors = {};
							
							angular.forEach(resp.items, function(el, index, array){
								$rootScope.doctors[el.id] = el;
							})

							deferred.resolve(_api);
						}
						else {
				            deferred.reject({code:resp.error.code, message:resp.error.message});
						}
		        	});
		        	
					deferred.resolve(_api);
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

.factory('$rtc',  ['$q', '$config', '$rootScope', function ($q, $config, $rootScope) {

	
	if(!$rootScope.organisation.settings.supportVideoCalls){
		return {
			supportVideoCalls : false
		};
	}
	
	var selfVideoEl = null;
	var callerVideoEl = null;
	var applicationName = $rootScope.organisation.apikey;
	var roomName = "c4c";
	var userName = $rootScope.user ? $rootScope.user.name : "Doctor";	
	
	//rtc
	if (window.location.protocol == "https:"){
		easyrtc.setSocketUrl($config.rtcServer.httpsUrl);
	}
	else {
		easyrtc.setSocketUrl($config.rtcServer.httpUrl);
	}
		
	easyrtc.enableAudio(true);
	easyrtc.enableAudioReceive(true);    
	easyrtc.enableDataChannels(true);

	easyrtc.setApplicationName(applicationName);
	easyrtc.setUsername(userName);	
	
	easyrtc.joinRoom(roomName,
					$rootScope.organisation.name,
					function(roomName){
						console.log("Doctor " + userName + " joined room " + roomName);
					},
					function(error){
						console.log("Doctor " + userName + " counld not join room. Error : " + error);
					}
	);

	easyrtc.connect(applicationName, 
			function(id){
				//connection successful
				$rootScope.user.callId = id;
				easyrtc.setRoomApiField(roomName, "doctor", $rootScope.user.name);
			}, 
			function(error){
				//connection successful
			    console.log("Cannot connect. Error : " + error);
			} 
	);
	
	var connectToRoom = function(roomName) {
	
		easyrtc.setRoomOccupantListener(function(room, data){

				//remove doctors from the list
				angular.forEach(data, function(el, index){
					if(!el.apiField || el.apiField.doctor){
						delete data[index];
					};
				});			
			
				$rootScope.$broadcast('$callerListChanged', data);			  
		});		  
	}
	
	var hangup = function(){
		easyrtc.hangupAll();
	}
	
	var setPresense = function(status){
		easyrtc.setPresense(status, "");
	}
	
	easyrtc.setAcceptChecker(function(callerId, callback){
		$rootScope.$broadcast('$incomingCall', {callerId:callerId, callback:callback});
	});
	
	easyrtc.setStreamAcceptor(function(callerId, stream){

        if(easyrtc.getLocalStream()) {
        	
        	easyrtc.setVideoObjectSrc(selfVideoEl, easyrtc.getLocalStream());
            selfVideoEl.muted = true;		

    		easyrtc.setVideoObjectSrc(callerVideoEl, stream);

    		$rootScope.$broadcast('$callConnected', callerId);
        }
        else {
        	
        	$rootScope.$broadcast('$localStreamFailed', callerId);
        }
	});

	easyrtc.setOnStreamClosed(function(callerId){
	    easyrtc.setVideoObjectSrc(callerVideoEl, "");
        $rootScope.$broadcast('$callDisconnected', callerId);
	});	
	
	var hangup = function(caller){
		
		if(caller){
			easyrtc.hangup(caller);
		}
		else {
			easyrtc.hangupAll();
		}
	}	
	
	return {
		supportVideoCalls : true,
		connectToRoom : connectToRoom,
		setSelfVideoEl : function(el){
			selfVideoEl = el;
		},
		setCallerVideoEl : function(el){
			callerVideoEl = el;
		},
		hangup : hangup,		
		setPresense : setPresense
	}

}])
;