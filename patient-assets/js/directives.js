'use strict'

angular.module("directives", [])
.directive('svgHead', function(){
	return {
        restrict: 'E',
        templateUrl: '/client-assets/css/img/body_head.svg',
        link: function (scope, element, attrs) {
            
        }
    }
})
.directive('svgChest', function(){
	return {
        restrict: 'E',
        templateUrl: '/client-assets/css/img/body_chest.svg',
        link: function (scope, element, attrs) {
            
        }
    }
})
.directive('svgAbdomen', function(){
	return {
        restrict: 'E',
        templateUrl: '/client-assets/css/img/body_center.svg',
        link: function (scope, element, attrs) {
            
        }
    }
})
.directive('svgArmLeft', function(){
	return {
        restrict: 'E',
        templateUrl: '/client-assets/css/img/body_arm_left.svg',
        link: function (scope, element, attrs) {
            
        }
    }
})
.directive('svgArmRight', function(){
	return {
        restrict: 'E',
        templateUrl: '/client-assets/css/img/body_arm_right.svg',
        link: function (scope, element, attrs) {
            
        }
    }
})
.directive('svgLegs', function(){
	return {
        restrict: 'E',
        templateUrl: '/client-assets/css/img/body_legs.svg',
        link: function (scope, element, attrs) {
            
        }
    }
})


;