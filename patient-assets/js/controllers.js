angular.module("controllers", []).
	controller("AppCtrl", ['$scope', '$rootScope', '$mdDialog', '$api', function($scope, $rootScope, $mdDialog, $api){
		
		$scope.showPinpad = function ($event, next) {
			
	        var ret = $mdDialog.show({
	          targetEvent: $event,
	          templateUrl: '/client-assets/templates/pinpad.html',
	          parent: angular.element(document.body),
	          controller: 'PinpadCtrl',
	          locals: { 
	        	  		$next : next
	        	  	  }
	        });
	        
	        ret.then(function(val){
	        	if(next == 'new-session'){
	        		newSession();
	        	}
	        	else if(next == 'end-session'){
	        		endSession();
	        	}
	        	else if (next == 'logout'){
					location.href = "/auth/logout";	        		
	        	}
	        },function(){
	        	//do nothinf;
	        })
	    }
		
		var newSession = function(){
			$rootScope.session = null;
			$rootScope.patient = null;
			$rootScope.progress = 0;
			$rootScope.outcome = null;
			location.href = "/client";
		}		
		
		var endSession = function(){
			var _api = $api.get();

			if(_api && $rootScope.session){
				_api.session.end({id:$rootScope.session.id}).execute(function(resp){
					$rootScope.session = resp;
					$rootScope.progress = 100;
					location.hash = "/" + resp.id + "/end";
				});
			}
			else {
				newSession();
			}
		}
	}]).
	controller("PinpadCtrl", ['$scope', '$rootScope', '$mdDialog', '$next', function($scope, $rootScope, $mdDialog, $next){
		
		var pin = "";
		$scope.display = "";
		$scope.pinError = false;
		
		$scope.pinpadKeyPress = function(num){
			pin = pin + "" + num;
			$scope.display += "*";
			$scope.pinError = false;
		}

		$scope.pinpadClear = function(num){
			pin = "";
			$scope.display = "";
			$scope.pinError = false;
		}

		$scope.pinpadCheck = function(){
			if(pin == "1234"){
				$mdDialog.hide($next);
			}
			else {
				pin = "";
				$scope.display = "";				
				$scope.pinError = true;
			}
		}	
		
		$scope.cancel = function(){
			$mdDialog.cancel();
		}	
		
		
	}]).
	controller("PatientCtrl", ['$scope', '$rootScope',  '$routeParams', '$api', "$location", function($scope, $rootScope, $routeParams, $api, $location){

		var _api = $api.get();

		var loadPatients = function(order){
			var params = {
					organisation : $rootScope.organisation.id,
					limit : 100
			}
			
			if(order) {
				params.order = order;
			}
			
			_api.patient.list(params).execute(function(resp){
				
				if(resp.error) {
					$rootScope.$emit("$commsError", {title:"Can't load patients list", description : resp.error.message})
				}
				else {
					$scope.patients = resp.items;
					$scope.$apply()
				}
			});
		}
		
		var loadAppointment = function(order){
			var params = {
					organisation : $rootScope.organisation.id,
					limit : 100
			}
			
			if(order) {
				params.order = order;
			}
			
			_api.appointment.list(params).execute(function(resp){
				
				if(!resp.error) {
					$rootScope.$emit("$commsError", {title:"Can't load appointments", description : resp.error.message})
				}
				else {
					$scope.appointments = resp.items;
					$scope.$apply()
				}
			});
		}		

		//loadAppointment('date');
		loadPatients('ref');
		
		$rootScope.patient = null;
		
		$scope.selectPatient = function(patient, $event) {
			$rootScope.patient = patient;
			$rootScope.progress = 15;
			$location.path("/" + patient.id + "/reason");
	    };
	    
	    $scope.min = function(a,b){
	    	return Math.min(a,b);
	    }
	    
	    $rootScope.readyClass = "app-ready";
		
	}]).
	controller("StartCtrl", ['$scope', '$rootScope',  '$routeParams', '$api', "$location", "$mdDialog", "groupsOfSymptoms", "body", "$http", "$config", function($scope, $rootScope, $routeParams, $api, $location, $mdDialog, groupsOfSymptoms, body, $http, $config){
		
		var _api = $api.get();

		if(!$rootScope.patient){
			$rootScope.patient = {id:$routeParams.patient};
		}
		
		//set progress based on the path
		var _path = $location.path()

		if(_path.indexOf("gender") > 0){
			$rootScope.progress = 5;
		}
		else if (_path.indexOf("age") > 0){
			$rootScope.progress = 10;
		}
		else if (_path.indexOf("reason") > 0){
			$rootScope.progress = 15;
		}
		else if (_path.indexOf("groups") > 0){
			$rootScope.progress = 20;
		}
		else if (_path.indexOf("initial") > 0){
			$rootScope.progress = 25;
		}
		
		$scope.findByName = function(obj, name){
			var group;
			for(var i = 0; i < obj.length; i++){
				group = obj[i];
				if(group.name == name){
					return group;
				}
			}
			return null;
		}

		$scope.drillDown = function(g, index){
			
			if(g.deadEnd){
			    var confirm = $mdDialog.confirm()
		        	.title("Can't find your symptoms?")
		        	.content("If you can't find you symptoms you can end your assesnement session now.")
		        	.ariaLabel("Can't find symptoms ")
		        	.ok('End session')
		        	.cancel('Cancel');
			    
			    $mdDialog.show(confirm).then(function() {
			    	location.hash = "/0/end";
			    }, function() {

			    });
			}
			else {
				$scope.selected = g;
				$scope.selectedItem = index;
				$scope.layout = 3;
				
				if($scope.selectedBodyPart){
					$scope.selectedBodyPart2 = g.name
				}
			}
		}

		$scope.selectBodyPart = function(name){

			if(!$scope.selectedBodyPart2){
				$scope.layout = 2;
			}
			
			console.log(1);
			$scope.bodyView = true;
			$scope.symptomsLocation = $scope.findByName($scope.bodyParts, name);
			$scope.list = $scope.symptomsLocation.parts;
			$scope.selectedBodyPart = name;
			$scope.selected = null;
			$scope.selectedItem = null;
		}

		//initial state
		$scope.list = groupsOfSymptoms;
		$scope.bodyParts = body;
		
		$scope.backToList = function(){
			$scope.selectedBodyPart = null;
			$scope.selectedBodyPart2 = null;
			$scope.list = groupsOfSymptoms;
			$scope.selected = null;
			$scope.selectedItem = null;
			$scope.layout = 2;
		}
		
		$scope.start = function(ref){
			console.log("start");
			_api.patient.insert({ref:ref, organisation_id:$rootScope.organisation.id}).execute(function(resp){
				$rootScope.progress = 5;
				$rootScope.patient = {id:resp.id, ref:ref};
				//location.hash = "/" + resp.id + "/intro";
				location.hash = "/" + resp.id + "/gender";
			});
		}

		$scope.setGender = function(g){
			console.log("gender");
			_api.patient.update({id:$rootScope.patient.id, gender:g}).execute(function(resp){
				$rootScope.progress += 5;
				$rootScope.patient.gender = g;
				location.hash = "/" + resp.id + "/age";
			});
		}

		$scope.setAge = function(a){
			console.log("age");
			_api.patient.update({id:$rootScope.patient.id, age:a}).execute(function(resp){
				$rootScope.progress += 5;
				$rootScope.patient.age = a;
				location.hash = "/" + resp.id + "/reason";
			});
		}

		$scope.gotoDoctor = function(){
			$rootScope.progress += 5;
			location.hash = "/" + $rootScope.patient.id + "/doctor-reason";
		}
		
		$scope.gotoSymptoms = function(){
			$rootScope.progress += 5;
			location.hash = "/" + $rootScope.patient.id + "/symptom-groups";
		}
		
		$scope.newSession = function(symptom){
			console.log("new session");

			$rootScope.reasonForVisit = symptom.name
		
			_api.session.new({
					organisation : $rootScope.organisation.id,
					patient : $rootScope.patient.id,
					present : [symptom.id]
			}).execute(function(resp){
				
				if(resp.error){
					$rootScope.$emit("$commsError", {title:"Can't start diagnostic session", description : resp.error.message})
				}
				else {
					$rootScope.session = resp;
					location.hash = "/" + resp.id + "/symptom";
				}
			});
		}		

	    $rootScope.readyClass = "app-ready";
	    
	    $scope.bodyView = false;
	}]).	

	controller("QuestionsCtrl", ['$scope', '$rootScope',  '$routeParams', '$api', "$location", function($scope, $rootScope, $routeParams, $api, $location){
		
		var _api = $api.get();
		
		$scope.progress = null;

		if($rootScope.session){
			$scope.session = $rootScope.session;
			$scope.step = 1;
			
		    $rootScope.readyClass = "app-ready";
		}
		else {
			_api.session.get({id:$routeParams.session}).execute(function(resp){
				
				if(resp.error){
					$rootScope.$emit("$commsError", {title:"Can't load session", description : resp.error.message});
				}
				else {
					$rootScope.session = resp;
					$rootScope.patient = resp.patient;
					$rootScope.progress = 25; //this is a recovered session, we can set progress to 25%
	
				    $rootScope.readyClass = "app-ready";
					
					if(resp.outcome){
						var p = resp.outcome.probability * 100;
						
						if($rootScope.progress && p > $rootScope.progress){
							$rootScope.progress = p;
						}
						else{
							$rootScope.progress += 5;
						}
						
						$rootScope.outcome = Math.round(p)
					}
					
					$scope.session = $rootScope.session;
					$scope.step = 1;
					$scope.$apply();
				}
			});
		}
		

		$scope.question = function(symptoms){
			
			$scope.progress = 'indeterminate';
			
			var present = [];
			var absent = [];
			
			angular.forEach(symptoms, function(val){
				if(val.value == 'present')
					present.push(val.id);
				else
					absent.push(val.id);
			})
			
			_api.session.insertMultipleSymptoms({session:$rootScope.session.id, present:present, absent:absent}).execute(function(resp){

				if(resp.error) {
					$rootScope.$emit("$commsError", {title:"Can't save question", description : resp.error.message})
				}
				else {
					if($rootScope.progress < 95 && resp.next && resp.outcome.probability < 0.90){
						$scope.symptom = {value:null};
						$rootScope.session = resp;
	
						if(resp.outcome){
							var p = resp.outcome.probability * 100;
							
							if($rootScope.progress && p > $rootScope.progress){
								$rootScope.progress = p;
							}
							else{
								$rootScope.progress += 5;
							}
						}
	
						$rootScope.outcome = Math.round(p)
						
						$scope.session = $rootScope.session;
						$scope.step++;
						$scope.progress = null;
						$scope.$apply();
					}
					else {
						_api.session.end({id:$rootScope.session.id}).execute(function(resp){
							$rootScope.session = resp
							//$rootScope.progress = 100;
							location.hash = "/" + resp.id + "/end";
						});
					}
				}
			});
		}
		
	}])
	
	.controller("EndCtrl", ['$scope', '$rootScope',  "$location", '$rtc', function($scope, $rootScope, $location, $rtc){

		$rootScope.progress = 100;
	    $rootScope.readyClass = "app-ready";
	    
    	//rtc events
    	$rootScope.$on('$callerListChanged', function(event, data){
    		$scope.callers = data;
    		$scope.$apply();
    	});	    
	    
    	$scope.call = function(id){
    		$rootScope.callToId = id;
    		$location.path("/" + id + "/video-chat");
    	}
    	
	    $rtc.connectToRoom();
	    
	}])
	
	.controller("VideoChatCtrl", ['$scope', '$rootScope', '$routeParams', '$api', '$location', '$mdDialog', '$config', '$rtc' ,function($scope, $rootScope, $routeParams, $api, $location, $mdDialog, $config, $rtc){

		$rtc.setSelfVideoElement(document.getElementById("self"));
		$rtc.setCallerVideoElement(document.getElementById("caller"));
		
		$scope.call = function(){
			$rtc.hangup();
			$rtc.call($routeParams.caller);
			$scope.status = "connecting";
		}

		$scope.hangup = function(){
			$rtc.hangup($routeParams.caller);
			$scope.status = "disconnected";
			$scope.$apply();
		}

		$scope.mute = function(){

		}

    	$rootScope.$on('$localStreamFailed', function(event, data){
    		$scope.status = "localstreamfailed";
    		$scope.$apply();
    	});			
		
		
    	$rootScope.$on('$callRejejcted', function(event, data){
    		$scope.status = "rejected";
    		$scope.$apply();
    	});			

    	$rootScope.$on('$callDisconnected', function(event, data){
    		$scope.status = "disconnected";
    		$scope.$apply();
    	});			

    	$rootScope.$on('$callConnected', function(event, data){
    		$scope.status = "connected";
    		$scope.$apply();
    	});	    	
		
		$rtc.call($routeParams.caller); 
		
		$scope.status = "connecting";
		
	}])	
	;	