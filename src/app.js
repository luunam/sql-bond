'use strict';

angular.module('mainApp', ['ngRoute', 'ngMaterial', 'loginMenuModule', 'homeModule'])
    .config(['$locationProvider', '$routeProvider', function($locationProvider, $routeProvider) {
        $routeProvider
            .when('/', {
                templateUrl: 'src/components/login/loginView.html',
                controller: 'loginMenuController'
            })

            .when('/home', {
                templateUrl: 'src/components/home/home.html',
                controller: 'homeController'
            });
    }]);

