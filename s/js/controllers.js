angular.module("controllers", []).
	controller("AppCtrl", ['$scope', '$rootScope', '$mdSidenav', '$api', '$timeout', '$location', function($scope, $rootScope, $mdSidenav, $api, $timeout, $location){
		
		var _api;

		$scope.refresh = false;
		
		$scope.toggleSidenav = function(menuId) {
			    $mdSidenav(menuId).toggle();
		};
		
		$scope.back = function(){
			$location.path('/grid');			
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
		
		var timer = 0;
		var _api = $api.get();

		$rootScope.showBackBtn = false;
		
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
		
		$scope.showDetail = function(itemData, $event) {
			window.clearInterval(timer);
			timer = 0;
			$rootScope.item = itemData;
	    	$location.path("/session/" + itemData.id);
	    };

	    $scope.selected = [];
	    
	    $scope.toggle = function (item, list, $event) {
	        
	    	var idx = list.indexOf(item);
	        if (idx > -1) list.splice(idx, 1);
	        else list.push(item);

	        $event.stopPropagation();
	    };
	    
	    $scope.exists = function (item, list) {
	        return list.indexOf(item) > -1;
	    };	    
	    
		if($rootScope.gridItems){
			$scope.sessions	= $rootScope.gridItems;
		}
		else {
			$scope.sessions = null;
			loadSessions();
		}

		document.getElementById("left").style.visibility = "visible";
		document.getElementById("main").style.visibility = "visible";
		document.getElementById("progress").style.display = "none";
		
	}]).	
	controller("SessionCtrl", ['$scope', '$rootScope',  '$routeParams', '$api', function($scope, $rootScope, $routeParams, $api){
		
		var _api = $api.get();

		$rootScope.showBackBtn = true;
		
		var loadSession = function(){
			_api.session.get({id:$routeParams.id}).execute(function(resp){
				$scope.item = resp;
				$scope.$apply()
			});
		}

		if($rootScope.item){
			$scope.item	= $rootScope.item;
		}
		else {
			loadSession();
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
		
		document.getElementById("left").style.visibility = "visible";
		document.getElementById("main").style.visibility = "visible";
		document.getElementById("progress").style.display = "none";
		
	}]);	