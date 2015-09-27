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
        if (gapi.client.c4c) {
        	_api = gapi.client.c4c;

        	// get organisation
			_api.user.me().execute(function(resp){
				
				if(!resp.error) {
					$rootScope.user = resp;
					$rootScope.organisation = $rootScope.user.organisation;

					deferred.resolve(_api);
				}
				else {
		            deferred.reject({code:500, message:'Unspecified API load error'});
				}
			});       	
        } 
        else {
            deferred.reject('api load error');
        }
    }      

    return {
    	load : function() {
    	    //gapi.load('auth', {'callback': checkAuth});
    	    gapi.load('client', {'callback': clientReady});
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
}])
.factory('$rtc',  ['$q', '$config', '$rootScope', function ($q, $config, $rootScope) {

	var selfVideoEl = null;
	var callerVideoEl = null;	
	var applicationName = $rootScope.organisation.apikey;
	var roomName = "c4c";
	var patientName = $rootScope.patient ? $rootScope.patient.ref : "Patient";
	
	//rtc
	if (window.location.protocol == "https:"){
		easyrtc.setSocketUrl($config.rtcServer.httpsUrl);
	}
	else {
		easyrtc.setSocketUrl($config.rtcServer.httpUrl);
	}
		
	easyrtc.enableAudio(false);
	easyrtc.enableAudioReceive(true);    
	easyrtc.enableDataChannels(true);

	easyrtc.setApplicationName(applicationName);
	easyrtc.setUsername(patientName);	
	
	easyrtc.joinRoom(roomName,
			$rootScope.organisation.name,
			function(roomName){
				console.log("Patient " + patientName + " joined room " + roomName);
			},
			function(error){
				console.log("Patient " + patientName + " counld not join room. Error : " + error);
			}
	);	

	easyrtc.connect(applicationName, 
			function(id){
				//connection successful
				if(!$rootScope.patient){
					$rootScope.patient = {ref:"Patient", id:0};
					
				}
				$rootScope.patient.callId = id;

				easyrtc.setRoomApiField(roomName, "patient", $rootScope.patient.id);
			}, 
			function(error){
				//connection successful
			    console.log(error);
			} 
	);	
	
	var connectToRoom = function(roomName) {
		
		easyrtc.setRoomOccupantListener(function(room, data){
				
			angular.forEach(data, function(el, index){
					if(!el.apiField || el.apiField.patient){
						delete data[index];
					};
			});			
			
			$rootScope.$broadcast('$callerListChanged', data);			  
		});
	}
	
	var call = function (id){
		easyrtc.hangupAll();
		
		easyrtc.call(id, 
				function(){
			        if(easyrtc.getLocalStream()) {
			        	initSelfVideo();
			        	$rootScope.$broadcast('$callConnected', {});
			        }
			        else {
			        	$rootScope.$broadcast('$localStreamFailed', {});
			        }
				}, 
				function(){
					//failure do something
					easyrtc.setVideoObjectSrc(selfVideoEl, "");
				}, 
				function(accepted, id){
					if(!accepted){
						$rootScope.$broadcast('$callRejected', {});
					}
				}
		);
	}
	
	var hangup = function(caller){
		
		if(caller){
			easyrtc.hangup(caller);
		}
		else {
			easyrtc.hangupAll();
		}
	}
	
	var initSelfVideo = function() {
        easyrtc.setVideoObjectSrc(selfVideoEl, easyrtc.getLocalStream());
        selfVideoEl.muted = true;		
	}

    easyrtc.setStreamAcceptor(function(callerId, stream) {
        easyrtc.setVideoObjectSrc(callerVideoEl, stream);
    });		
      
    easyrtc.setOnStreamClosed( function (callerId) {
        easyrtc.setVideoObjectSrc(callerVideoEl, "");
        $rootScope.$broadcast('$callDisconnected', {});
    });		
	
	return {
		connectToRoom : connectToRoom,
		call : call,
		hangup : hangup,
		setSelfVideoElement : function(el){
			selfVideoEl = el;
		},
		setCallerVideoElement : function(el){
			callerVideoEl = el;
		}
	}

}])
;