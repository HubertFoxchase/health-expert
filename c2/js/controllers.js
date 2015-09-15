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

		$scope.start1 = function ($event) {
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
				$scope.newSession();
			}
			else {
				pin = "";
				$scope.display = "";				
				$scope.pinError = true;
			}
		}
		
		$scope.start = function ($event) {
			
			pin = "";
			$scope.display = "";
			$scope.pinError = false;
			
	        $mdDialog.show({
	          targetEvent: $event,
	          templateUrl: '/c2/templates/pinpad.html',
	          parent: angular.element(document.body),
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
					location.hash = "/list";
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
						location.hash = "/list";
					}
				}
			);
		}
	}]).
	controller("PatientCtrl", ['$scope', '$rootScope',  '$routeParams', '$api', "$location", function($scope, $rootScope, $routeParams, $api, $location){

		var _api = $api.get();

		var loadPatients = function(){
			_api.patient.list({organisation:$rootScope.organisation.id}).execute(function(resp){
				
				if(!resp.error) {
					$scope.patients = resp.items;
					$scope.$apply()
				}
				else {
					$rootScope.$emit("$commsError", {title:"API Error", description : "Can't load patients list."})
				}
			});
		}

		loadPatients();
		
		$rootScope.patient = null;
		
		$scope.selectPatient = function(patient, $event) {
			$rootScope.patient = patient;
			$rootScope.progress = 15;
			$location.path("/" + patient.id + "/reason");
	    };
	    
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
			$scope.selected = g;
			$scope.selectedItem = index;
			$scope.layout = 3;
			
			if($scope.selectedBodyPart){
				$scope.selectedBodyPart2 = g.name
			}
		}

		$scope.selectBodyPart = function(name){

			if(!$scope.selectedBodyPart2){
				$scope.layout = 2;
				$scope.selected = null;
			}
			console.log(1);
			$scope.bodyView = true;
			$scope.symptomsLocation = $scope.findByName($scope.bodyParts, name);
			$scope.list = $scope.symptomsLocation.parts;
			$scope.selectedBodyPart = name;
		}

		//initial state
		$scope.list = groupsOfSymptoms;
		$scope.bodyParts = body;
		
		$scope.backToList = function(){
			$scope.selectedBodyPart = null;
			$scope.selectedBodyPart2 = null;
			$scope.list = groupsOfSymptoms;
			$scope.selected = null;
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
			
			$rootScope.reasonForVisit = symptom.name
		
			_api.session.new({
					organisation : $rootScope.organisation.id,
					patient : $rootScope.patient.id,
					present : [symptom.id]
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

	    $rootScope.readyClass = "app-ready";
	    
	    $scope.bodyView = false;
	}]).	

	controller("EndCtrl", ['$scope', '$rootScope',  "$location", function($scope, $rootScope, $location){

		$rootScope.progress = 100;
	    $rootScope.readyClass = "app-ready";
		
	}]).
	
	
	controller("QuestionsCtrl", ['$scope', '$rootScope',  '$routeParams', '$api', "$location", function($scope, $rootScope, $routeParams, $api, $location){
		
		var _api = $api.get();

		if($rootScope.session){
			$scope.session = $rootScope.session;
			$scope.step = 1;
			
		    $rootScope.readyClass = "app-ready";
		}
		else {
			_api.session.get({id:$routeParams.session}).execute(function(resp){
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
					$scope.step++;
					$scope.$apply();
				}
				else {
					
					_api.session.end({id:$rootScope.session.id}).execute(function(resp){
						$rootScope.session = resp
						//$rootScope.progress = 100;
						location.hash = "/" + resp.id + "/end";
					});
				}
			});
		}
		
	}]);	