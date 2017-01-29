var format = require('string-format');

angular.module('homeModule', ['ngMaterial', 'ngRoute', 'md.data.table'])
    .config(['$mdThemingProvider', function ($mdThemingProvider) {
        'use strict';

        $mdThemingProvider.theme('default')
            .primaryPalette('blue');
    }])
    .service('homeService', homeService)
    .controller('homeController', homeController);

function homeService() {
    this.getValue = function() {
        return this.myValue;
    };

    this.setValue = function(newValue) {
        this.myValue = newValue;
    }
}

function homeController($scope, $location, homeService) {

    var connection = homeService.getValue();

    connection.query('SHOW DATABASES;', function(err, rows, cols) {
        if (err != null) {
            console.log('ERROR: ' + err);
        } else {
            $scope.databases = rows.map(function(row) {
               return row.Database;
            });
        }
    });

    //$scope.databases = ['Corn' ,'Onions' ,'Kale' ,'Arugula' ,'Peas', 'Zucchini'];
    $scope.searchTerm = '';
    $scope.selectedDatabase = '';
    $scope.selected = [];

    $scope.logout = logout;
    $scope.clearSearchTerm = clearSearchTerm;
    $scope.changeDatabase = changeDatabase;
    $scope.selectTable = selectTable;

    $scope.tables = [];
    $scope.colNames = [];
    $scope.tableRows = [];

    $scope.createData = createData;
    $scope.updateData = updateData;
    $scope.deleteData = deleteData;

    function clearSearchTerm() {
        $scope.searchTerm = '';

    }

    function logout() {
        $location.path('/');
    }

    function changeDatabase() {
        $scope.selected = [];
        connection.query(format('use {};', $scope.selectedDatabase), function(err, rows, cols) {
            if (err != null) {
                console.log('ERROR: ' + err);
            } else {
                connection.query("show tables;", function(err, rows, cols) {
                    $scope.tables = rows.map(function(table) {
                        return { name: table['Tables_in_' + $scope.selectedDatabase] }
                    })
                });
            }
        })

    }

    function selectTable(tableIdx) {
        $scope.selected = [];
        $scope.tableName = $scope.tables[tableIdx].name;
        connection.query("select * from " + $scope.tableName + ";", function(err, rows, cols) {
            $scope.$apply(function() {
                $scope.colNames = cols.map(function (col) {
                    return col.name;
                });
                $scope.tableRows = rows;
            });
        })
    }

    function createData() {

    }

    function updateData() {

    }

    function deleteData() {

    }

    // The md-select directive eats keydown events for some quick select
    // logic. Since we have a search input here, we don't need that logic.
    //$element.find('input').on('keydown', function(ev) {
    //    ev.stopPropagation();
    //});
}