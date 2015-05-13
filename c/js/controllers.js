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
			_api.patient.update({id:$rootScope.patient.id, gender:g}).execute(function(resp){
				$rootScope.patient.gender = g;
				location.hash = "/" + resp.id + "/age";
			});
		}

		$scope.age = function(a){
			
			if(!isNaN(a)) {
				_api.patient.update({id:$rootScope.patient.id, age:a}).execute(function(resp){
					$rootScope.patient.age = a;
					location.hash = "/" + resp.id + "/reason";
				});
			}
			else{
				location.hash = "/" + $rootScope.patient.id + "/reason";
			}
		}

		$scope.session = function(){
			_api.session.insert({patient_id:$rootScope.patient.id}).execute(function(resp){
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
						
						_api.session.get({id:$routeParams.session}).execute(function(resp){
							$rootScope.session = resp;
							$rootScope.patient = resp.patient;
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
		
		$scope.questionSingle = function(symptom){
			
			_api.session.insertSymptom({session:$rootScope.session.id, id:symptom.id, value:symptom.value}).execute(function(resp){

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
		
		$scope.questionMulti = function(symptoms){
			
			var present = [];
			var absent = [];
			
			angular.forEach(symptoms, function(val){
				if(val.value == 'present')
					present.push(val.id);
				else
					absent.push(val.id);
			})
			
			_api.session.insertSymptoms({session:$rootScope.session.id, present:present, absent:absent}).execute(function(resp){

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