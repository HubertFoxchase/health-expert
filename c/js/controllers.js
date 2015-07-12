angular.module("controllers", []).
	controller("AppCtrl", ['$scope', '$rootScope', '$mdSidenav', '$mdDialog', '$api', function($scope, $rootScope, $mdSidenav, $mdDialog, $api){
		$scope.end = function ($event) {
	        $mdDialog.show({
	          targetEvent: $event,
	          template:
	            '<md-dialog>' +
	            '  <md-dialog-content><h3>End assesment</h3><p>Would you like to end your current assessment session?</p></md-dialog-content>' +
	            '  <div class="md-actions" layout="row">' +
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
	            '  <md-dialog-content><h3>New session</h3><p>Would you like to start a new assessment session?</p></md-dialog-content>' +
	            '  <div class="md-actions" layout="row">' +
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
					$rootScope.outcome = null;
					
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

	controller("StartCtrl", ['$scope', '$rootScope',  '$routeParams', '$api', "$location", "$mdDialog", "groupsOfSymptoms", function($scope, $rootScope, $routeParams, $api, $location, $mdDialog, groupsOfSymptoms){
		
		var _api = $api.get();
		
		if(!$rootScope.patient){
			$rootScope.patient = {id:$routeParams.patient};
		}
		
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
		
		$scope.groupsOfSymptoms = groupsOfSymptoms;

		if($routeParams.groupId) {
			$scope.initialSymptoms = groupsOfSymptoms[$routeParams.groupId];
		}
		
		$scope.start = function(ref){
			console.log("start");
			_api.patient.insert({ref:ref, organisation:"6192449487634432"}).execute(function(resp){
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

		$scope.setReason = function(id){
			console.log("reason");
			$rootScope.progress += 5;
			location.hash = "/" + $rootScope.patient.id + "/groups";
		}
		
		$scope.setInitialSymptoms = function(id){
			console.log("initial symptoms");
			$rootScope.progress += 5;
			location.hash = "/" + $rootScope.patient.id + "/initial/" + id;
		}
		
		$scope.newSession = function(symptom){
			console.log("new session");

			var showError = function() {
				$mdDialog.show({
		          template:
			            '<md-dialog>' +
			            '  <md-dialog-content><h3>Hmm... something went wrog here</h3><p>Probably missing or incorrect symptom data. Try another symptom.</p></md-dialog-content>' +
			            '  <div class="md-actions" layout="row">' +
			            '    <md-button ng-click="closeDialog()">' +
			            '      Close' +
			            '    </md-button>' +
			            '  </div>' +
			            '</md-dialog>',
			            controller: 'AppCtrl'
			        });					
			}
			
			if(!symptom || symptom == ""){
				showError();
			}
			else {
				_api.session.new({
						patient:$rootScope.patient.id,
						present:[symptom]
				}).execute(function(resp){
					
					if(resp.error){
						showError();
					}
					else {
						$rootScope.session = resp;
						location.hash = "/" + resp.id + "/symptom";
					}
				});
			}
		}		

		document.getElementById("main").style.visibility = "visible";
		document.getElementById("progress").style.display = "none";

	}]).	
	
	controller("QuestionsCtrl", ['$scope', '$rootScope',  '$routeParams', '$api', "$location", function($scope, $rootScope, $routeParams, $api, $location){
		
		console.log("question");
		
		var _api = $api.get();
		
		if($rootScope.session){
			$scope.session = $rootScope.session;
			
			document.getElementById("main").style.visibility = "visible";
			document.getElementById("progress").style.display = "none";
			
		}
		else {
			_api.session.get({id:$routeParams.session}).execute(function(resp){
				$rootScope.session = resp;
				$rootScope.patient = resp.patient;
				$rootScope.progress = 25; //this is a recovered session, we can set progress to 25%

				document.getElementById("main").style.visibility = "visible";
				document.getElementById("progress").style.display = "none";
				
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
				$scope.$apply();
			});
		}
		

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

				if(resp.next && resp.outcome.probability < 0.90){
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