(function () {
  angular
    .module('sqlBond')
    .config(['$mdThemingProvider', function ($mdThemingProvider) {
      'use strict';

      $mdThemingProvider.theme('default')
        .primaryPalette('blue');
    }])
    .config(['$routeProvider', function ($routeProvider) {
      $routeProvider
        .when('/', {
          templateUrl: 'components/views/login/templates/login.view.html',
          controller: 'LoginController'
        })

        .when('/home', {
          templateUrl: 'components/views/home/templates/home.view.html',
          controller: 'HomeController',
          controllerAs: 'model'
        });
    }]);
})();
