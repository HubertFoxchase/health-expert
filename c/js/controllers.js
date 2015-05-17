angular.module("controllers", []).
	controller("AppCtrl", ['$scope', '$rootScope', '$mdSidenav', '$mdDialog', '$api', function($scope, $rootScope, $mdSidenav, $mdDialog, $api){
	    
		$scope.end = function ($event) {
	        $mdDialog.show({
	          targetEvent: $event,
	          template:
	            '<md-dialog>' +
	            '  <md-content><h3>End assesment</h3><p>Would you like to end your current assesment session?</p></md-content>' +
	            '  <div class="md-actions">' +
	            '    <md-button ng-click="closeDialog()">' +
	            '      No, continue' +
	            '    </md-button>' +
	            '    <md-button ng-click="endSession()">' +
	            '      Okay' +
	            '    </md-button>' +
	            '  </div>' +
	            '</md-dialog>',
	            controller: 'AppCtrl'
	            
	        });
	    }

		$scope.start = function ($event) {
	        $mdDialog.show({
	          targetEvent: $event,
	          template:
	            '<md-dialog>' +
	            '  <md-content><h3>New session</h3><p>Would you like to start a new assesmsnt session?</p></md-content>' +
	            '  <div class="md-actions">' +
	            '    <md-button ng-click="closeDialog()">' +
	            '      No, continue' +
	            '    </md-button>' +
	            '    <md-button ng-click="newSession()">' +
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

		$scope.newSession = function(){
			$mdDialog.hide().then(
				function(){
					$rootScope.session = null;
					$rootScope.patient = null;
					$rootScope.progress = 0;
					location.hash = "/start";
				}
			);
		}
		
		
		$scope.endSession = function(){
			$mdDialog.hide().then(
				function(){
					var _api = $api.get();

					if(_api && $rootScope.session){
						_api.session.end({id:$rootScope.session.id}).execute(function(resp){
							$rootScope.session = resp;
							$rootScope.progress = 100;
							location.hash = "/" + resp.id + "/end";
						});
					}
					else {
						$rootScope.session = null;
						$rootScope.patient = null;
						$rootScope.progress = 0;
						location.hash = "/start";
					}
				}
			);
		}
		
	}]).

	controller("StartCtrl", ['$scope', '$rootScope',  '$routeParams', '$api', "$location", "groupsOfSymptoms", function($scope, $rootScope, $routeParams, $api, $location, groupsOfSymptoms){
		
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
				$rootScope.progress = 5;
				$rootScope.patient = {id:resp.id, ref:ref};
				//location.hash = "/" + resp.id + "/intro";
				location.hash = "/" + resp.id + "/gender";
			});
		}

		$scope.gender = function(g){
			_api.patient.update({id:$rootScope.patient.id, gender:g}).execute(function(resp){
				$rootScope.progress += 5;
				$rootScope.patient.gender = g;
				location.hash = "/" + resp.id + "/age";
			});
		}

		$scope.age = function(a){
			
			if(!isNaN(a)) {
				_api.patient.update({id:$rootScope.patient.id, age:a}).execute(function(resp){
					$rootScope.progress += 5;
					$rootScope.patient.age = a;
					location.hash = "/" + resp.id + "/reason";
				});
			}
			else{
				location.hash = "/" + $rootScope.patient.id + "/reason";
			}
		}
		
		$scope.setInitialSymptoms = function(id){
			location.hash = "/" + $rootScope.patient.id + "/initial/" + id;
		}
		
		$scope.session = function(symptom){
			_api.session.new({
					patient:$rootScope.patient.id,
					present:[symptom]
			}).execute(function(resp){
				$rootScope.session = resp;
				location.hash = "/" + resp.id + "/symptom";
			});
		}		
		
		$scope.groupsOfSymptoms = groupsOfSymptoms;

		if($routeParams.groupId)
			$scope.initialSymptoms = groupsOfSymptoms[$routeParams.groupId];
		
	}]).	
	
	controller("QuestionsCtrl", ['$scope', '$rootScope',  '$routeParams', '$api', "$location", function($scope, $rootScope, $routeParams, $api, $location){
		
		var _api = $api.get();
		
		if(!_api){
			$api.load().then(
					function(data){
						document.getElementById("main").style.visibility = "visible";
						document.getElementById("progress").style.display = "none";
						_api = $api.get();
						
						_api.session.get({id:$routeParams.session}).execute(function(resp){
							$rootScope.session = resp;
							$rootScope.patient = resp.patient;
							
							if(resp.outcome){
								var p = resp.outcome.probability * 100;
								
								if($rootScope.progress && p > $rootScope.progress){
									$rootScope.progress = p;
								}
								else{
									$rootScope.progress += 7;
								}
							}
							
							$scope.session = $rootScope.session;
							$scope.$apply();
						});
					}
			)
		}

		var sessionId = $routeParams.session;
		
		if(!$rootScope.session){
			$rootScope.session = {id:sessionId};
		}
		
		$scope.session = $rootScope.session;
		
		$scope.question = function(symptoms){
			
			var present = [];
			var absent = [];
			
			angular.forEach(symptoms, function(val){
				if(val.value == 'present')
					present.push(val.id);
				else
					absent.push(val.id);
			})
			
			_api.session.insertMultipleSymptoms({session:$rootScope.session.id, present:present, absent:absent}).execute(function(resp){

				if(resp.next && resp.outcome.probability < 0.85){
					$scope.symptom = {value:null};
					$rootScope.session = resp;

					if(resp.outcome){
						var p = resp.outcome.probability * 100;
						if(p > $rootScope.progress){
							$rootScope.progress = p;
						}
					}
					
					$scope.session = $rootScope.session;
					$scope.$apply();
				}
				else {
					
					_api.session.end({id:$rootScope.session.id}).execute(function(resp){
						$rootScope.session = resp
						$rootScope.progress = 100;
						location.hash = "/" + resp.id + "/end";
					});
				}
			});
		}
		
	}]);	