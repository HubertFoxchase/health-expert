angular.module("controllers", []).
	controller("AppCtrl", ['$scope', '$rootScope', '$mdSidenav', '$timeout', '$mdDialog', '$location', function($scope, $rootScope, $mdSidenav, $timeout, $mdDialog, $location){
		
		$scope.refresh = false;
		
		$scope.toggleSidenav = function(menuId) {
			    $mdSidenav(menuId).toggle();
		};
		
		$scope.back = function(){
			if($rootScope.backLocation)
				$location.path($rootScope.backLocation); 
			else
				$location.path("/grid"); 
		}
		
		var poll = function(){
			$timeout(function(){
					if($scope.refresh){
						$rootScope.$broadcast('refresh');
					}
					poll();
				},
				5000);
		}
		poll();
	}]).
	controller("GridCtrl", ['$scope', '$rootScope', '$routeParams', '$api', '$location', '$mdDialog', '$rtc', function($scope, $rootScope, $routeParams, $api, $location, $mdDialog, $rtc){
		
		var _api = $api.get();

		$rootScope.showBackBtn = false;
		$rootScope.backLocation = "/grid";
		$scope.appointmentsLoading = true;
		$scope.showCallers = false;
		$rootScope.patient = null;
		$rootScope.item = null;
		$rootScope.doctor = null;
		
	    
		$scope.selected = [];
		
		var loadSessions = function(params){
			_api.session.listActive(params).execute(function(resp){
				
				if(!resp.error){
					$scope.sessions = resp.items;
					$rootScope.gridItems = resp.items;
					$scope.$apply()
				}
				else if(resp.error.code == 401){
					$rootScope.$emit('$unauthorised', resp.error);
				}
				else if(resp.error.code == 403){
					$rootScope.$emit('$forbidden', resp.error);
				}
			});
		}
		
		var loadAppointments = function(params){
			
			var func;
			
			if(params.doctor_id){
				func = _api.appointment.listByDoctor;
			}
			else{
				func = _api.appointment.list;
			}
			
			func(params).execute(function(resp){
				
				if(!resp.error){
					$scope.appointmentsLoading = false;
					$scope.appointments = resp.items;
					$scope.$apply()
				}
				else if(resp.error.code == 401){
					$rootScope.$emit('$unauthorised', resp.error);
				}
				else if(resp.error.code == 403){
					$rootScope.$emit('$forbidden', resp.error);
				}

			});
		}		

		var params = {
				organisation_id:$rootScope.organisation.id,
				order : 'date'
		};

			
		
		if($routeParams.doctor) {
			$scope.doctor_id = params.doctor_id = $rootScope.doctor = $routeParams.doctor;	
		}
		
		loadSessions(params);
		loadAppointments(params);
		
			
		$rootScope.$on('refresh', function(){
			loadSessions($routeParams.doctor);
		});
		
		$scope.showDetail = function(itemData, $event) {
			$rootScope.item = itemData;
	    	$location.path("/session/" + itemData.id);
	    };

	    $scope.toggle = function (item, list, $event) {
	        
	    	var idx = list.indexOf(item);
	        if (idx > -1) list.splice(idx, 1);
	        else list.push(item);

	        $event.stopPropagation();
	    };
	    
	    $scope.exists = function (item, list) {
	        return list.indexOf(item) > -1;
	    };	 
	    
	    $scope.clearSelected = function(){
		    $scope.selected = [];
	    }

		$scope.deleteSelected = function(selected){
			_api.session.deleteByIdList({ids:selected}).execute(function(resp){
				if(!resp.error) {
					var list = $scope.sessions;
			    	angular.forEach(selected, function(value, key) {
			    		for(i=0;i<list.length;i++){
			    			if(list[i].id == value){
						        list.splice(i, 1);
						        break;
			    			}
			    		}
			    	});
					$scope.$apply()
				}
				else if(resp.error.code == 401){
					$rootScope.$emit('$unauthorised', resp.error);
				}
				else if(resp.error.code == 403){
					$rootScope.$emit('$forbidden', resp.error);
				}					
			});
		}
	    
	    $scope.markSelected = function(){
		    //$scope.selected = [];
	    }
	    
	    $scope.updateSelected = function(){
		    //$scope.selected = [];
	    }
	    
		$scope.newAppointment = function ($event) {
			
	        var ret = $mdDialog.show({
	          targetEvent: $event,
	          templateUrl: '/dashboard-assets/templates/appointmentSelector.html',
	          parent: angular.element(document.body),
	          controller: 'AppointmentSelectCtrl',
	          locals: { $patient : null,
	        	  		$appointment : null 
	        	  	  }
	        });
	        
	        ret.then(function(val){
	        	loadAppointments();
	        },function(){
	        	//do nothinf;
	        })
	    }
		
		$scope.newPatient = function ($event) {
			$location.path("/patient/0");
	    }
		
		$scope.sameDay = function (d1, d2){
			return moment(d1).isSame(moment(d2), 'd');
		}
	    
		if($rtc.supportVideoCalls){
			
			$scope.showCallers = true;
			
			$rootScope.rtcCall = function(id){
				
			
			}
			
			var callback = {};
			var callerId;
			var patientId;
			
			$rootScope.$on('$incomingCall', function(event, data){
	
				callerId = data.callerId
				
				if($rootScope.callers[callerId].apiField.patient)
					patientId = $rootScope.callers[callerId].apiField.patient.fieldValue;
				
				$rootScope.callers[callerId].status = 'rinning';
				callback[callerId] = data.callback;
				
				$scope.callers = $rootScope.callers;
	    		$scope.$apply();

			});	
			
	    	$rootScope.$on('$callerListChanged', function(event, data){
	    		
        		for(var callerId in data){
            		
        			if($rootScope.callers && $rootScope.callers[callerId]){
        				data[callerId].status = $rootScope.callers[callerId].status;
        			}
        			else {
        				data[callerId].status = 'idle';
        			}
        		}
	    		
				$scope.callers = $rootScope.callers = data;
	    		$scope.$apply();
	    	});
			
			$scope.acceptCall =  function(callerId, $event){
	
		        var ret = $mdDialog.show({
			          templateUrl: '/dashboard-assets/templates/videoChat.html',
			          parent: angular.element(document.body),
			          controller: 'VideoChatCtrl',
			          locals: {
			        	  $callerId : callerId
			          },
			          onComplete : function(){
			      		
			              	$rtc.setSelfVideoEl(document.getElementById("self"));
			              	$rtc.setCallerVideoEl(document.getElementById("caller"));
			              	
							callback[callerId](true);
							
							$rootScope.callers[callerId].status = 'connecting';
			          }
			        });
			        
			        ret.then(function(val){
			        	$rtc.hangup();
			        },
			        function(){
			        	$rtc.hangup();
			        });			
				
				$event.stopPropagation();			
			}
			
			$scope.rejectCall = function(callerId, $event){
				callback[callerId](false);
				$rootScope.callers[callerId].status = 'idle';
			}
			
			$rtc.connectToRoom();			

		}
		console.log("Grid page loaded: " + (Date.now() - start) + " ms");
	    
	    $rootScope.readyClass = "app-ready";
	}]).	
	controller("SessionDetailCtrl", ['$scope', '$rootScope',  '$routeParams', '$api', '$location', '$observations', function($scope, $rootScope, $routeParams, $api, $location, $observations){
		
		var _api = $api.get();

		$rootScope.showBackBtn = true;
		
		$scope.symptomFilter = 'present';
		
		var loadSession = function(){
			_api.session.get({id:$routeParams.id}).execute(function(resp){
				
				if(!resp.error){
					$scope.item = resp;
					
					angular.forEach($scope.item.symptoms.items, function(val){
						val.parent = $observations.getParent(val.id, true)
					});
					
					$scope.$apply();
				}
				else if(resp.error.code == 401){
					$rootScope.$emit('$unauthorised', resp.error);
				}
				else if(resp.error.code == 403){
					$rootScope.$emit('$forbidden', resp.error);
				}
			});
		}

		loadSession();
		
		$rootScope.$on('refresh', function(){
			loadSession();
		});
		
		$scope.indent = function(id){
			if($observations.hasParent(id)){
				return "indented";
			}
		}
		
		$scope.back = function(){
			if($rootScope.backLocation)
				$location.path($rootScope.backLocation); 
			else
				$location.path("/grid"); 
		}
		
		$scope.delete = function(id){
			_api.session.delete({id:$routeParams.id}).execute(function(resp){
				if(!resp.error){
					$rootScope.gridItems = null;
					$scope.back();
				}
				else if(resp.error.code == 401){
					$rootScope.$emit('$unauthorised', resp.error);
				}
				else if(resp.error.code == 403){
					$rootScope.$emit('$forbidden', resp.error);
				}
			});
		}

		$scope.review = function(id){
			_api.session.markReviewed({id:$routeParams.id}).execute(function(resp){
				if(!resp.error){
					$rootScope.gridItems = null;
					$scope.back();
				}
				else if(resp.error.code == 401){
					$rootScope.$emit('$unauthorised', resp.error);
				}
				else if(resp.error.code == 403){
					$rootScope.$emit('$forbidden', resp.error);
				}
			});
		}

		$rootScope.readyClass = "app-ready";
	
	}]).
	controller("HistoryCtrl", ['$scope', '$rootScope',  '$routeParams', '$api', '$location', '$mdToast', function($scope, $rootScope, $routeParams, $api, $location, $mdToast){
		
		var _api = $api.get();

		$rootScope.showBackBtn = false;
		$rootScope.backLocation = "/history";
		$scope.historyLoading =  true;
		$rootScope.item = null;

		$scope.selected = [];
		
		var orderDirection = {};

		var loadSessions = function(params){
			
			var toast = $mdToast
							.simple()
							.content('Loading ...')
							.position("top right")
							.parent(document.getElementById("main-content-container"))
							.hideDelay(0);
			$mdToast.show(toast);
			
			var _params = {
					limit : 25,
					order : "-updated"
			}
			
			if(params){
				angular.extend(_params, params);
			}			
			
			_api.session.list(_params).execute(function(resp){

				$mdToast.hide();

				if(!resp.error){
					$scope.historyLoading =  false;
					$scope.sessions = resp.items;
					$scope.pageToken = resp.items.pageToken;
					$rootScope.gridItems = resp.items;
					$scope.$apply()
				}
				else if(resp.error.code == 401){
					$rootScope.$emit('$unauthorised', resp.error);
				}
				else if(resp.error.code == 403){
					$rootScope.$emit('$forbidden', resp.error);
				}				
			});
		}

		loadSessions();
		
		$rootScope.$on('refresh', function(){
			if($scope.order){
				loadSessions({order:$scope.order});
			}
			else {
				loadSessions();
			}
		});
		
		$scope.setOrder = function(val){
			
			if(orderDirection[val]){
				orderDirection[val] = !orderDirection[val];
			}
			else {
				orderDirection[val] = true;
			}
			
			$scope.order =  orderDirection[val] ? val : ("-" + val);
			
			if($scope.patients && $scope.patients.length < 25){
				$scope.orderRepeater = $scope.order;
			}
			else {
				$scope.orderRepeater = null;
				loadSessions({order:$scope.order});			
			}
		}		
		
		$scope.showDetail = function(itemData, $event) {
			$rootScope.item = itemData;
	    	$location.path("/session/" + itemData.id);
	    };

	    $scope.toggle = function (item, list, $event) {
	        
	    	var idx = list.indexOf(item);
	        if (idx > -1) list.splice(idx, 1);
	        else list.push(item);

	        $event.stopPropagation();
	    };
	    
	    $scope.exists = function (item, list) {
	        return list.indexOf(item) > -1;
	    };	 

	    $scope.toggleAll = function(list, $event){
	    	
	    	if(list.length == $scope.sessions.length){
	    		$scope.selected = [];
	    	}
	    	else {
	    		$scope.selected = [];
		    	angular.forEach($scope.sessions, function(value, key) {
		    		$scope.selected.push(value.id);
		    	});
	    	}
	    }
	    
	    $scope.clearSelected = function(){
		    $scope.selected = [];
	    }

		$scope.deleteSelected = function(selected){
			
			if(selected && selected.length > 0) {
				
				var str = selected.length == 1 ? "Deleting session ... " : 'Deleting ' + selected.length + ' sessions ...'
				var toast = $mdToast
							.simple()
							.content(str)
							.position("top right")
							.parent(document.getElementById("main-content-container"))
							.hideDelay(0);
				$mdToast.show(toast);				
			
				_api.session.deleteByIdList({ids:selected}).execute(function(resp){

					$mdToast.hide();
					
					if(!resp.error) {
						var list = $scope.sessions;
				    	angular.forEach(selected, function(value, key) {
				    		for(i=0;i<list.length;i++){
				    			if(list[i].id == value){
							        list.splice(i, 1);
							        break;
				    			}
				    		}
				    	});
				    	$scope.selected = [];
						$scope.$apply();
					}
					else if(resp.error.code == 401){
						$rootScope.$emit('$unauthorised', resp.error);
					}
					else if(resp.error.code == 403){
						$rootScope.$emit('$forbidden', resp.error);
					}					
				});
			}
		}
	    
	    $scope.markSelected = function(){
		    //$scope.selected = [];
	    }
	    
	    $scope.updateSelected = function(){
		    //$scope.selected = [];
	    }		
		
	    $rootScope.readyClass = "app-ready";
		
	}]).
	controller("AccountCtrl", ['$scope', '$rootScope',  '$routeParams', '$api', '$location', function($scope, $rootScope, $routeParams, $api, $location){
		
		var _api = $api.get();
		$scope.selected = [];
		$rootScope.item = null;		
		
		$rootScope.showBackBtn = false;

		var loadUsers = function(){
			_api.user.list({organisation_id:$rootScope.organisation.id}).execute(function(resp){
				if(!resp.error){
					$scope.users = resp.items;
					$scope.$apply();
				}
				else if(resp.error.code == 401){
					$rootScope.$emit('$unauthorised', resp.error);
				}
				else if(resp.error.code == 403){
					$rootScope.$emit('$forbidden', resp.error);
				}
			});
		}

		loadUsers();
		
		$scope.showDetail = function(itemData, $event) {
			$rootScope.item = itemData;
	    	$location.path("/user/" + itemData.id);
	    };
	    
		$scope.deleteSelected = function(selected){
			_api.user.deleteByIdList({ids:selected}).execute(function(resp){
				if(!resp.error) {
					var list = $scope.users;
			    	angular.forEach(selected, function(value, key) {
			    		for(i=0;i<list.length;i++){
			    			if(list[i].id == value){
						        list.splice(i, 1);
						        break;
			    			}
			    		}
			    	});
			    	$scope.selected = [];
					$scope.$apply()
				}
				else if(resp.error.code == 401){
					$rootScope.$emit('$unauthorised', resp.error);
				}
				else if(resp.error.code == 403){
					$rootScope.$emit('$forbidden', resp.error);
				}
			});
		}
		
		$scope.toggle = function (item, list, $event) {
	        
	    	var idx = list.indexOf(item);
	        if (idx > -1) list.splice(idx, 1);
	        else list.push(item);

	        $event.stopPropagation();
	    };
	    
	    $scope.exists = function (item, list) {
	        return list.indexOf(item) > -1;
	    };	 

	    $scope.toggleAll = function(list, $event){
	    	
	    	if(list.length == $scope.users.length){
	    		$scope.selected = [];
	    	}
	    	else {
	    		$scope.selected = [];
		    	angular.forEach($scope.sessions, function(value, key) {
		    		$scope.selected.push(value.id);
		    	});
	    	}
	    }
	    
	    $scope.clearSelected = function(){
		    $scope.selected = [];
	    }

	    $rootScope.readyClass = "app-ready";
		
	}]).
	controller("UserDetailCtrl", ['$scope', '$rootScope',  '$routeParams', '$api', '$location', function($scope, $rootScope, $routeParams, $api, $location){
		
		var _api = $api.get();

		$rootScope.showBackBtn = true;
		$rootScope.backLocation = "/account";
		$scope.allowChange = true;
		
		var loadUser = function(){
			_api.user.get({id:$routeParams.id}).execute(function(resp){
				if(!resp.error){
					$scope.user = resp;
					$scope.$apply()
				}
				else if(resp.error.code == 401){
					$rootScope.$emit('$unauthorised', resp.error);
				}
				else if(resp.error.code == 403){
					$rootScope.$emit('$forbidden', resp.error);
				}				
			});
		}

		if($routeParams.id && $routeParams.id != "0"){
			$scope.allowChange = $routeParams.id == $rootScope.user.id || $rootScope.user.isAdmin;
			loadUser();
		}
		else {
			$scope.user = {
					id : 0,
					organisation_id : $rootScope.organisation.id
			}
		}
		
		$scope.save = function(user){
			
			if(user && user.id > 0){
				_api.user.update(user).execute(function(resp){
					if(resp){
						$location.path("/account");
					}
					
				});
			}
			else {
				_api.user.insert(user).execute(function(resp){
					if(!resp.error){
						$location.path("/account");
					}
					else if(resp.error.code == 401){
						$rootScope.$emit('$unauthorised', resp.error);
					}
					else if(resp.error.code == 403){
						$rootScope.$emit('$forbidden', resp.error);
					}				
				});
			}
		}		
		
	    $rootScope.readyClass = "app-ready";
		
	}]).
	controller("InviteUserCtrl", ['$scope', '$rootScope',  '$api', '$location', '$httpParamSerializer', '$http', function($scope, $rootScope, $api, $location, $httpParamSerializer, $http){
		
		var _api = $api.get();

		$rootScope.showBackBtn = true;
		$rootScope.backLocation = "/account";
		$scope.user = {email : null, 
						role : null, 
						organisation_id : $rootScope.organisation.id,
						organisation_name : $rootScope.organisation.name,
						sender_name : $rootScope.user.name}
		
		$scope.invite = function(user){

			$scope.resp = null;
			$http({
				method  : 'POST',
				url     : '/auth/ajax/inviteuser',
				data    : $httpParamSerializer($scope.user), //forms user object
				headers : {'Content-Type': 'application/x-www-form-urlencoded'} 
			 })
			 .success(function(data) {
				 $scope.resp = data;
			 });			
		}		
		
	    $rootScope.readyClass = "app-ready";
		
	}]).	
	controller("PatientsCtrl", ['$scope', '$rootScope',  '$routeParams', '$api', '$location', '$mdToast', function($scope, $rootScope, $routeParams, $api, $location, $mdToast){
		
		var _api = $api.get();
		$rootScope.showBackBtn = false;
		$rootScope.backLocation = "/patients";		
		$scope.selected = [];
		$rootScope.patient = null;
		$scope.order = "";
		var orderDirection = {};

		var loadPatients = function(params){

			var toast = $mdToast
						.simple()
						.content('Loading ...')
						.position("top right")
						.parent(document.getElementById("main-content-container"))
						.hideDelay(0);
			$mdToast.show(toast);
			
			var _params = {
					limit : 25,
					order : "ref"
			}
			
			if(params){
				angular.extend(_params, params);
			}
			
			_api.patient.list(_params).execute(function(resp){

				$mdToast.hide();
				
				if(!resp.error){
					$scope.patients = resp.items;
					$scope.$apply();
				}
				else if(resp.error.code == 401){
					$rootScope.$emit('$unauthorised', resp.error);
				}
				else if(resp.error.code == 403){
					$rootScope.$emit('$forbidden', resp.error);
				}				
			});
		}

		loadPatients();
		
		$scope.setOrder = function(val){
			
			if(orderDirection[val]){
				orderDirection[val] = !orderDirection[val];
			}
			else {
				orderDirection[val] = true;
			}
			
			$scope.order =  orderDirection[val] ? val : ("-" + val);
			
			if($scope.patients && $scope.patients.length < 25){
				$scope.orderRepeater = $scope.order;
			}
			else {
				$scope.orderRepeater = null;
				loadPatients({order:$scope.order});			
			}
		}
		
		$scope.showDetail = function(itemData, $event) {
			$rootScope.patient = itemData;
	    	$location.path("/patient/" + itemData.id);
	    };		

		$scope.newPatient = function(){
			$rootScope.patient = null;
			$location.path("/patient/0");
		}

		$scope.deleteSelected = function(selected){

			if(selected && selected.length > 0) {
				
				var str = selected.length == 1 ? "Deleting patient ... " : 'Deleting ' + selected.length + ' patients ...'
				var toast = $mdToast
							.simple()
							.content(str)
							.position("top right")
							.parent(document.getElementById("main-content-container"))
							.hideDelay(0);
				$mdToast.show(toast);			
				
				_api.patient.deleteByIdList({ids:selected}).execute(function(resp){
					
					$mdToast.hide();
					
					if(!resp.error) {
						var list = $scope.patients;
				    	angular.forEach(selected, function(value, key) {
				    		for(i=0;i<list.length;i++){
				    			if(list[i].id == value){
							        list.splice(i, 1);
							        break;
				    			}
				    		}
				    	});
				    	$scope.selected = [];
						$scope.$apply()
					}
					else if(resp.error.code == 401){
						$rootScope.$emit('$unauthorised', resp.error);
					}
					else if(resp.error.code == 403){
						$rootScope.$emit('$forbidden', resp.error);
					}				
				});
			}
		}
		
		$scope.toggle = function (item, list, $event) {
	        
	    	var idx = list.indexOf(item);
	        if (idx > -1) list.splice(idx, 1);
	        else list.push(item);

	        $event.stopPropagation();
	    };
	    
	    $scope.exists = function (item, list) {
	        return list.indexOf(item) > -1;
	    };	 

	    $scope.toggleAll = function(list, $event){
	    	
	    	if(list.length == $scope.users.length){
	    		$scope.selected = [];
	    	}
	    	else {
	    		$scope.selected = [];
		    	angular.forEach($scope.sessions, function(value, key) {
		    		$scope.selected.push(value.id);
		    	});
	    	}
	    }
	    
	    $scope.clearSelected = function(){
		    $scope.selected = [];
	    }

	    $rootScope.readyClass = "app-ready";

	}]).
	controller("PatientDetailCtrl", ['$scope', '$rootScope',  '$routeParams', '$api', '$location', '$mdDialog', function($scope, $rootScope, $routeParams, $api, $location, $mdDialog){
		
		var _api = $api.get();

		$rootScope.showBackBtn = true;
		$scope.appointmentsLoading = true;
		
		var loadPatient = function(){
			_api.patient.get({id:$routeParams.id}).execute(function(resp){
				if(!resp.error) {
					$scope.patient = resp;
					
					//massage the date for input=date since it is returned in the wrong format
					if($scope.patient.dob) {
						$scope.patient.dob = moment($scope.patient.dob).toDate(); 
					}
					
					$scope.$apply()
				}
				else if(resp.error.code == 401){
					$rootScope.$emit('$unauthorised', resp.error);
				}
				else if(resp.error.code == 403){
					$rootScope.$emit('$forbidden', resp.error);
				}				
			});
		}

		var loadPatientAppointments = function(){
			_api.appointment.listByPatient({patient_id:$routeParams.id}).execute(function(resp){
				if(!resp.error){
					$scope.appointmentsLoading = false;
					$scope.appointments = resp.items;
					$scope.$apply();
				}
				else if(resp.error.code == 401){
					$rootScope.$emit('$unauthorised', resp.error);
				}
				else if(resp.error.code == 403){
					$rootScope.$emit('$forbidden', resp.error);
				}				
			});
		}
		
		$scope.showAppointment = function ($event, appointment) {
			
	        var ret = $mdDialog.show({
	          targetEvent: $event,
	          templateUrl: '/dashboard-assets/templates/appointmentSelector.html',
	          parent: angular.element(document.body),
	          controller: 'AppointmentSelectCtrl',
	          locals: { $appointment : appointment,
	        	  		$doctor : null,
	        	  		$patient : null
	        	      }
	        });
	        
	        ret.then(function(val){
	        	loadPatientAppointments();
	        },function(){
	        	//do nothinf;
	        })
	    }		
		
		
		$scope.newAppointment = function ($event, patient) {
			
	        var ret = $mdDialog.show({
	          targetEvent: $event,
	          templateUrl: '/dashboard-assets/templates/appointmentSelector.html',
	          parent: angular.element(document.body),
	          controller: 'AppointmentSelectCtrl',
	          locals: { $patient : patient,
	        	  		$doctor : $rootScope.doctor,
	        	  		$appointment : null
	        	  	  }
	        });
	        
	        ret.then(function(val){
	        	loadPatientAppointments();
	        },function(){
	        	//do nothinf;
	        })
	    }		
		
		if($rootScope.patient){
			$scope.patient = $rootScope.patient;

			//massage the date for input=date since it is returned in the wrong format
			if($scope.patient.dob) {
				$scope.patient.dob = moment($scope.patient.dob).toDate(); 
			}
			
			if($scope.doNewAppointment){
				$scope.doNewAppointment = false;
				$scope.newAppointment(null, $scope.patient);
			}
			
			loadPatientAppointments();
		}
		else if($routeParams.id && $routeParams.id != "0") {
			loadPatient();
			loadPatientAppointments();
		}
		else {
			$scope.appointmentsLoading = false;
			$scope.patient = {
					id : 0,
					organisation_id : $rootScope.organisation.id
			}
		}
		
		$scope.back = function(){
			$rootScope.patient = null;
			
			if($rootScope.backLocation)
				$location.path($rootScope.backLocation); 
			else
				$location.path("/patients")
		}
		
		$scope.updateAge = function(patient){
			patient.age = moment().diff(patient.dob, 'y');
			$scope.userForm.age.$setDirty();
		}
		
		$scope.save = function(patient, newAppointment){
			
			if (typeof (patient.dob) == "object"){
				patient.dob.setHours(12);
			}
			
			if(patient.id && patient.id != "0"){
				_api.patient.update(patient).execute(function(resp){
					if(!resp.error){
						$scope.back();
					}
					else if(resp.error.code == 401){
						$rootScope.$emit('$unauthorised', resp.error);
					}
					else if(resp.error.code == 403){
						$rootScope.$emit('$forbidden', resp.error);
					}				
				});
			}
			else {
				_api.patient.insert(patient).execute(function(resp){
					if(!resp.error){
						if(newAppointment){
							$rootScope.patient = resp;
							$rootScope.doNewAppointment = true;
							$location.path("/patient/" + resp.id);
						}
						else {
							$scope.back();
						}
					}
					else if(resp.error.code == 401){
						$rootScope.$emit('$unauthorised', resp.error);
					}
					else if(resp.error.code == 403){
						$rootScope.$emit('$forbidden', resp.error);
					}				
				});
			}
		}
		
	    $rootScope.readyClass = "app-ready";
		
	}]).
	controller("AppointmentSelectCtrl", ['$scope', '$rootScope', '$api', '$location', '$mdDialog', '$config', '$patient', '$appointment', '$doctor', function($scope, $rootScope, $api, $location, $mdDialog, $config, $patient, $appointment, $doctor){
		
		var _api = $api.get();
		
		$scope.changed = false;
		$scope.dateChanged = false;
		$scope.hourChanged = false;
		$scope.minutesChanged = false;
		
		$scope.weekDays = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
		
		var _hours = [];
		for(i = $config.calendar.officeOpenHour; i<$config.calendar.officeCloseHour; i++){
			_hours.push(i);
		}
		
		var _minutes = [];
		for(i=0; i<60;i=i+$config.calendar.appointmentStep){
			_minutes.push(i);
		}

		$scope.days = [];
		$scope.hours = [];
		$scope.minutes = [];
		
		$scope.hoursSet = _hours;
		$scope.minutesSet = _minutes;
		$scope.daysSet = [];

		$scope.today = moment();

		if($appointment) {
			$scope.appointmentDuration = $appointment.duration;
			$scope.doctor = $appointment.doctor.id;
			$scope.selected = moment($appointment.date);
			$scope.date = moment($appointment.date);
			$scope.changed = true;
			$scope.dateChanged = true;
			$scope.hourChanged = true;
			$scope.minutesChanged = true;
			$scope.appointment = $appointment;
		}
		else {
			$scope.date = moment();
			$scope.appointmentDuration = $config.calendar.appointmentDuration;
			$scope.doctor = $doctor;

			if($scope.today.hour() > $config.calendar.officeCloseHour){
				$scope.selected = moment($scope.today).add(1, 'd');
				$scope.selected.hour($config.calendar.officeOpenHour);
				$scope.selected.minute(0);
			}
			else if ($scope.today.hour() < $config.calendar.officeOpenHour){
				$scope.selected = moment($scope.today); 
				$scope.selected.hour($config.calendar.officeOpenHour);
				$scope.selected.minute(0);
			}
			else {
				$scope.selected = moment($scope.today); 
				$scope.selected.minute(($scope.selected.minute() / $scope.appointmentDuration >> 0) * $scope.appointmentDuration); 
			}
		}
		
		var prepareCalendar = function(refDate, today, daysOnly, selected){

			var date = moment(refDate);
			var month = date.month();

			date.startOf('month');
			
			var day = date.day();
			
			var firstDate = moment(date).subtract(day - 1, 'd');
			
			var days = [];

			for(i=0;i<35;i++){
				if(daysOnly){
					days.push({
						day:firstDate.date(), 
						isToday: firstDate.isSame(today, 'day'), 
						isThisMonth: month == firstDate.month(), 
						moment : moment(firstDate)
					});
				}
				else {
					days.push({
						isSelected : selected && firstDate.isSame(selected, 'day'),
						moment : moment(firstDate)
					});
				}
				firstDate.add(1, 'd');
			}
			
			return days;
		}
		
		var prepareHours = function(hoursSet, selected){

			var _hours = [];

			for(i=0;i<hoursSet.length;i++){
				_hours.push({
								hour : hoursSet[i], 
								//isThisHour : $scope.today.hour() == _hours[i], 
								isSelected : selected && selected.hour() == hoursSet[i]
							});
			}
			
			return _hours;
		}
		
		var prepareMinutes = function(minutesSet, selected, duration){

			var _minutes = [];

			for(i=0;i<minutesSet.length;i++){
				_minutes.push({
									minute : minutesSet[i], 
									//isThisMinute : Math.abs($scope.today.minute() - _minutes[i]) < 5, 
									isSelected : (minutesSet[i] - selected.minute()) >= 0 && (minutesSet[i] - selected.minute()) < duration
									});
			}
			return _minutes;
		}		
		
		$scope.daysSet = prepareCalendar($scope.date, $scope.today, true, $scope.selected);
		$scope.days = prepareCalendar($scope.date, $scope.today, false, $scope.selected);
		$scope.hours = prepareHours($scope.hoursSet, $scope.selected);
		$scope.minutes = prepareMinutes($scope.minutesSet, $scope.selected, $scope.appointmentDuration);
		
		$scope.chageMonth =  function(d){
			$scope.date.add(d, 'month');
			$scope.daysSet = prepareCalendar($scope.date, $scope.today, true, $scope.selected);
			//$scope.changed = true;
		}
		
		$scope.setDate = function(evt, m){
			$scope.selected = moment(m).hour($scope.selected.hour()).minute($scope.selected.minute());
			$scope.days = prepareCalendar($scope.date, $scope.today, false, $scope.selected);
			$scope.changed = true;
			$scope.dateChanged = true;
		}

		$scope.setToday = function(evt){
			$scope.selected = moment().hour($scope.selected.hour()).minute($scope.selected.minute());
			
			if($scope.date.month() != moment().month()){
				$scope.date.month(moment().month());
				$scope.daysSet = prepareCalendar($scope.date, $scope.today, true, $scope.selected);
			}
				
			$scope.days = prepareCalendar($scope.date, $scope.today, false, $scope.selected);
			$scope.changed = true;
			$scope.dateChanged = true;
		}

		$scope.setTomorrow = function(evt){
			$scope.selected = moment().add(1, 'd').hour($scope.selected.hour()).minute($scope.selected.minute());

			if($scope.date.month() != $scope.selected.month()){
				$scope.date.month($scope.selected.month());
				$scope.daysSet = prepareCalendar($scope.date, $scope.today, true, $scope.selected);
			}
			
			$scope.days = prepareCalendar($scope.date, $scope.today, false, $scope.selected);
			$scope.changed = true;
			$scope.dateChanged = true;
		}
		
		$scope.setHour = function(evt, h){
			$scope.selected.hour(h);
			$scope.hours = prepareHours($scope.hoursSet, $scope.selected);
			$scope.changed = true;
			$scope.hourChanged = true;
		}

		$scope.setMinute = function(evt, m){
			$scope.selected.minute(m);
			$scope.minutes = prepareMinutes($scope.minutesSet, $scope.selected, $scope.appointmentDuration);
			$scope.changed = true;
			$scope.minutesChanged = true;		
		}
		
		$scope.cancel = function(){
			$mdDialog.cancel();
		}	

		$scope.save = function(){
			
			if($appointment){
	        	var params = {
	        			id : $appointment.id,
		        		date: $scope.selected.toDate(),
		        		duration: $scope.appointmentDuration,
		        		doctor_id: $scope.doctor,
		        	}
		        	
				_api.appointment.update(params).execute(function(resp){
					if(resp){
						$mdDialog.hide();
					}
				});
			}
			else {
	        	var params = {
		        		date: $scope.selected.toDate(),
		        		duration: $scope.appointmentDuration,
		        		doctor_id:$scope.doctor,
		        		patient_id:$patient.id
		        	}
		        	
				_api.appointment.insert(params).execute(function(resp){
					if(resp){
						$mdDialog.hide();
					}
				});
			}
		}	
	}])
	.controller("VideoChatCtrl", ['$scope', '$rootScope', '$api', '$location', '$mdDialog', '$config', '$rtc', '$callerId',function($scope, $rootScope, $api, $location, $mdDialog, $config, $rtc, $callerId){

		$scope.status = "connecting";
		$scope.callerId = $callerId;
		
		$scope.hangup = function(id){
			$rtc.hangup(id);
			$scope.status = "disconnected";
			//$scope.$apply();
		}

		$scope.mute = function(){

		}

    	$rootScope.$on('$localStreamFailed', function(event, data){
    		$scope.status = "localstreamfailed";
    		//$scope.$apply();
    	});			
		
    	$rootScope.$on('$callDisconnected', function(event, callerId){
    		$scope.status = "disconnected";
    		$rootScope.callers[callerId].status = "idle";
    		//$scope.$apply();
    	});	
    	
    	$rootScope.$on('$callConnected', function(event, callerId){
    		$scope.status = "connected";
    		$rootScope.callers[callerId].status = "talking";
    		//$scope.$apply();
    	});    	

		$scope.cancel = function(){
			$mdDialog.cancel();
		}
	}]);
	
	
	
	