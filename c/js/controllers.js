angular.module("controllers", []).
	controller("AppCtrl", ['$scope', '$mdSidenav', '$mdDialog', '$api', function($scope, $mdSidenav, $mdDialog, $api){
	    
		$scope.restart = function ($event) {
	        $mdDialog.show({
	          targetEvent: $event,
	          template:
	            '<md-dialog>' +
	            '  <md-content><h3>Restart</h3><p>Do you want to resart current session?</p></md-content>' +
	            '  <div class="md-actions">' +
	            '    <md-button ng-click="closeDialog()">' +
	            '      No, continue' +
	            '    </md-button>' +
	            '    <md-button ng-click="restartSession()">' +
	            '      Okay' +
	            '    </md-button>' +
	            '  </div>' +
	            '</md-dialog>',
	            controller: 'AppCtrl'
	            
	        });
	    }
		
		$scope.closeDialog = function(){
			$mdDialog.hide();
		}

		$scope.restartSession = function(){
			$mdDialog.hide().then(
				function(){
					location.hash = "/start"
				}
			);
		}
		
	}]).

	controller("StartCtrl", ['$scope', '$rootScope',  '$routeParams', '$api', "$location", function($scope, $rootScope, $routeParams, $api, $location){
		
		var _api = $api.get();
		
		var patientId = $routeParams.patient;
		
		if(!$rootScope.patient){
			$rootScope.patient = {id:patientId};
		}
		
		if(!_api){
			$api.load().then(
					function(data){
						document.getElementById("main").style.visibility = "visible";
						document.getElementById("progress").style.display = "none";
						_api = $api.get();
					}
			)
		}

		$scope.start = function(ref){
			_api.patient.insert({ref:ref, organisation:"6192449487634432"}).execute(function(resp){
				$rootScope.patient = {id:resp.id, ref:ref};
				location.hash = "/" + resp.id + "/intro";
			});
		}

		$scope.gender = function(g){
			_api.patient.update({id:$rootScope.patient, gender:g}).execute(function(resp){
				$rootScope.patient.gender = g;
				location.hash = "/" + resp.id + "/age";
			});
		}

		$scope.age = function(a){
			
			if(angular.isNumber(a)) {
				_api.patient.update({id:$rootScope.patient.id, age:a}).execute(function(resp){
					$rootScope.patient.age = a;
					location.hash = "/" + resp.id + "/reason";
				});
			}
			else{
				location.hash = "/" + resp.id + "/reason";
			}
		}

		$scope.session = function(a){
			_api.session.insert({patient:$rootScope.patient.id}).execute(function(resp){
				$rootScope.session = resp;
				location.hash = "/" + resp.id + "/symptom";
			});
		}		
		
	}]).	
	controller("QuestionsCtrl", ['$scope', '$rootScope',  '$routeParams', '$api', "$location", function($scope, $rootScope, $routeParams, $api, $location){
		
		var _api = $api.get();
		
		if(!_api){
			$api.load().then(
					function(data){
						document.getElementById("main").style.visibility = "visible";
						document.getElementById("progress").style.display = "none";
						_api = $api.get();
					}
			)
		}

		var sessionId = $routeParams.session;
		
		if(!$rootScope.session){
			$rootScope.session = {id:sessionId};
		}
		
		$scope.session = $rootScope.session;
		
		$scope.question = function(value){
			_api.session.insertSymptom({id:$rootScope.session.id, name:$rootScope.session.next.label, value:value}).execute(function(resp){

				if(resp.next){
					$scope.symptom = {value:null};
					$rootScope.session = resp;
					$scope.session = $rootScope.session;
					$scope.$apply();
				}
				else {
					
					_api.session.end({id:$rootScope.session.id}).execute(function(resp){
						location.hash = "/" + resp.id + "/end";
					});
				}
			});
		}
	}]);	