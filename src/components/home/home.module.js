angular.module('homeModule', ['ngMaterial', 'ngRoute', 'md.data.table', 'ngMdIcons'])
  .config(['$mdThemingProvider', function ($mdThemingProvider) {
    'use strict';

    $mdThemingProvider.theme('default')
      .primaryPalette('blue');
  }]);