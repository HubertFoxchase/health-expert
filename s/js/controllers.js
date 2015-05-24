angular.module("controllers", []).
	controller("AppCtrl", ['$scope', '$rootScope', '$mdSidenav', '$api', '$timeout', function($scope, $rootScope, $mdSidenav, $api, $timeout){
		
		var _api;
		
		$scope.toggleSidenav = function(menuId) {
			    $mdSidenav(menuId).toggle();
		};
		
		$scope.keepPolling = false;
		
		var poll = function(){
			$timeout(function(){
					if($scope.keepPolling){
						$rootScope.$broadcast('refresh');
					}
					poll();
				},
				5000);
		}
		poll();	
	}]).
	controller("GridCtrl", ['$scope', '$rootScope', '$routeParams', '$api', '$location', function($scope, $rootScope, $routeParams, $api, $location){
		
		var timer = 0;
		var _api = $api.get();

		var loadSessions = function(){
			_api.session.listActive().execute(function(resp){
				$scope.sessions = resp.items;
				$rootScope.gridItems = resp.items;
				$scope.$apply()
			});
		}

		$rootScope.$on('refresh', function(){
			loadSessions();
		})
		
		$scope.showDetail = function($event, itemData) {
			window.clearInterval(timer);
			timer = 0;
			$rootScope.item = itemData;
	    	$location.path("/session/" + itemData.id);
	    };
	    
		$scope.authorise = function(){
			$api.handleAuthClick().then(
					function(data){ //success
						document.getElementById("main").style.visibility = "visible";
						document.getElementById("progress").style.display = "none";
						_api = $api.get();
						location.hash = "/grid";
					},
					function(data){ //failed
						$scope.authFailed = true;
					}
			);
		}	    

		if(_api) {
			if($rootScope.gridItems){
				$scope.sessions	= $rootScope.gridItems;
			}
			else {
				$scope.sessions = null;
				loadSessions();
			}
			//timer = window.setInterval(loadSessions, 5000);
		}
		else {
			$api.load().then(
					function(data){ //success
						document.getElementById("main").style.visibility = "visible";
						document.getElementById("progress").style.display = "none";
						_api = $api.get();
						loadSessions();
					},
					function(data){ //failed
						document.getElementById("main").style.visibility = "visible";
						document.getElementById("progress").style.display = "none";
						location.hash = "/authorise";
					}
			)			
		}
	}]).	
	controller("SessionCtrl", ['$scope', '$rootScope',  '$routeParams', '$api', function($scope, $rootScope, $routeParams, $api){
		
		var _api = $api.get();

		if(_api) {
			
			if($rootScope.item){
				$scope.item	= $rootScope.item;
			}
			else {
				loadSessions();
			}
		}
		else {
			$api.load().then(
					function(data){ //success
						document.getElementById("main").style.visibility = "visible";
						document.getElementById("progress").style.display = "none";
						_api = $api.get();
						loadSession();
					},
					function(data){ //failed
						document.getElementById("main").style.visibility = "visible";
						document.getElementById("progress").style.display = "none";
						location.hash = "/authorise";
					}
			)			
		}
			
		var loadSession = function(){
			_api.session.get({id:$routeParams.id}).execute(function(resp){
				$scope.item = resp;
				$scope.$apply()
			});
		}
		
		$scope.delete = function(id){
			_api.session.markDeleted({id:$routeParams.id}).execute(function(resp){
				$rootScope.gridItems = null;
		    	location.hash = "/grid";
			});
		}

		$scope.reviewed = function(id){
			_api.session.markReviewed({id:$routeParams.id}).execute(function(resp){
				$rootScope.gridItems = null;
		    	location.hash = "/grid";
			});
		}		
	}]);	