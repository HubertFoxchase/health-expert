angular.module("controllers", []).
	controller("AppCtrl", ['$scope', '$rootScope', '$mdSidenav', '$api', '$timeout', '$location', function($scope, $rootScope, $mdSidenav, $api, $timeout, $location){
		
		var _api;

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
	controller("GridCtrl", ['$scope', '$rootScope', '$routeParams', '$api', '$location', function($scope, $rootScope, $routeParams, $api, $location){
		
		var _api = $api.get();

		$rootScope.showBackBtn = false;
		$rootScope.backLocation = "/grid";
	    
		$scope.selected = [];
		
		var loadSessions = function(){
			_api.session.listActive({organisation:$rootScope.organisation.id}).execute(function(resp){
				$scope.sessions = resp.items;
				$rootScope.gridItems = resp.items;
				$scope.$apply()
			});
		}
		
		loadSessions();

		$rootScope.$on('refresh', function(){
			loadSessions();
		})
		
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
				if(resp) {
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
			});
		}
	    
	    $scope.markSelected = function(){
		    //$scope.selected = [];
	    }
	    
	    $scope.updateSelected = function(){
		    //$scope.selected = [];
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
				$scope.item = resp;
				
				angular.forEach($scope.item.symptoms.items, function(val){
					val.parent = $observations.getParent(val.id, true)
				});
				
				$scope.$apply()
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
				$rootScope.gridItems = null;
				$scope.back();
			});
		}

		$scope.reviewed = function(id){
			_api.session.markReviewed({id:$routeParams.id}).execute(function(resp){
				$rootScope.gridItems = null;
				$scope.back();
			});
		}		

		$rootScope.readyClass = "app-ready";
	
	}]).
	controller("HistoryCtrl", ['$scope', '$rootScope',  '$routeParams', '$api', '$location', function($scope, $rootScope, $routeParams, $api, $location){
		
		var _api = $api.get();

		$rootScope.showBackBtn = false;
		$rootScope.backLocation = "/history";

		$scope.selected = [];

		var loadSessions = function(){
			_api.session.list({organisation:$rootScope.organisation.id}).execute(function(resp){
				$scope.sessions = resp.items;
				$rootScope.gridItems = resp.items;
				$scope.$apply()
			});
		}

		loadSessions();
		
		$rootScope.$on('refresh', function(){
			loadSessions();
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
			_api.session.deleteByIdList({ids:selected}).execute(function(resp){
				if(resp) {
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
			});
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
		
		$rootScope.showBackBtn = false;

		var loadUsers = function(){
			_api.user.list({organisation_id:$rootScope.organisation.id}).execute(function(resp){
				$scope.users = resp.items;
				$scope.$apply()
			});
		}

		loadUsers();
		
		$scope.showDetail = function(itemData, $event) {
			$rootScope.item = itemData;
	    	$location.path("/user/" + itemData.id);
	    };
	    
		$scope.delete = function(id){
			_api.user.deleted({id:id}).execute(function(resp){
				loadUsers();
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
		
		var loadUser = function(){
			_api.user.get({id:$routeParams.id}).execute(function(resp){
				$scope.user = resp;
				$scope.$apply()
			});
		}

		if($routeParams.id && $routeParams.id != "0"){
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
					if(resp){
						$location.path("/account");
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
		$scope.user = {email:null, role:null, organisation_id:$rootScope.organisation.id}
		
		$scope.invite = function(user){

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
	controller("PatientsCtrl", ['$scope', '$rootScope',  '$routeParams', '$api', '$location', function($scope, $rootScope, $routeParams, $api, $location){
		
		var _api = $api.get();
		$rootScope.showBackBtn = false;
		$scope.selected = [];

		var loadPatients = function(){
			_api.patient.list({organisation:$rootScope.organisation.id}).execute(function(resp){
				$scope.patients = resp.items;
				$scope.$apply()
			});
		}

		loadPatients();
		
		$scope.showDetail = function(itemData, $event) {
			$rootScope.patient = itemData;
	    	$location.path("/patient/" + itemData.id);
	    };		

		$scope.newPatient = function(){
	    	$location.path("/patient/0");
		}

		$scope.deleteSelected = function(selected){
			_api.patient.deleteByIdList({ids:selected}).execute(function(resp){
				if(resp) {
					var list = $scope.patients;
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
	controller("PatientDetailCtrl", ['$scope', '$rootScope',  '$routeParams', '$api', '$location', function($scope, $rootScope, $routeParams, $api, $location){
		
		var _api = $api.get();

		$rootScope.showBackBtn = true;
		$rootScope.backLocation = "/patients";
		
		var loadPatient = function(){
			_api.patient.get({id:$routeParams.id}).execute(function(resp){
				$scope.patient = resp;
				$scope.$apply()
			});
		}
		
		if($rootScope.patient){
			$scope.patient = $rootScope.patient;
		}
		else if($routeParams.id && $routeParams.id != "0") {
			loadPatient();
		}
		else {
			$scope.patient = {
					id : 0,
					organisation_id : $rootScope.organisation.id
			}
		}
		
		$scope.back = function(){
			$location.path("/patients"); 
		}
		
		$scope.save = function(patient){
			
			if(patient.id && patient.id != "0"){
				_api.patient.update(patient).execute(function(resp){
					if(resp){
						$scope.back();
					}
				});
			}
			else {
				_api.patient.insert(patient).execute(function(resp){
					if(resp){
						$scope.back();
					}
				});
			}
		}		
		
	    $rootScope.readyClass = "app-ready";
		
	}]);
	
	
	
	
	