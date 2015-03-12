angular.module("controllers", []).
	controller("AppCtrl", ['$scope', '$mdSidenav', '$api', function($scope, $mdSidenav, $api){
		
		var _api;
		
		$scope.toggleSidenav = function(menuId) {
			    $mdSidenav(menuId).toggle();
		};
		
		$api.loadApi().then(

			function(data){
				document.getElementById("main").style.visibility = "visible";
				_api = data;
				loadSessions();
			},
			function(){
				
			}
		)
		
		var loadSessions = function(){
			
			_api.session.listActive().execute(function(resp){
				console.log(resp);
				$scope.sessions = resp.items;
				$scope.$apply()
			});
		}
	}]);