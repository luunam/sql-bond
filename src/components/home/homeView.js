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
    console.log('PANEL SUCCESS');

    var connection = homeService.getValue();

    connection.query('SHOW DATABASES;', function(err, rows, cols) {
        if (err != null) {
            console.log('ERROR: ' + err);
        } else {
            console.log(rows);
            console.log(cols);
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

    function clearSearchTerm() {
        $scope.searchTerm = '';

    }

    function logout() {
        $location.path('/');
    }

    function changeDatabase() {
        console.log('Database changed');
        console.log($scope.selectedDatabase);
        console.log(typeof $scope.selectedDatabase);
        connection.query("use " + $scope.selectedDatabase + ";", function(err, rows, cols) {
            if (err != null) {
                console.log('ERROR: ' + err);
            } else {
                connection.query("show tables;", function(err, rows, cols) {
                    console.log(rows);
                    console.log(cols);
                    $scope.tables = rows.map(function(table) {
                        return { name: table['Tables_in_' + $scope.selectedDatabase] }
                    })
                });
            }
        })

    }

    function selectTable(tableIdx) {

        $scope.tableName = $scope.tables[tableIdx].name;
        connection.query("select * from " + $scope.tableName + ";", function(err, rows, cols) {
            $scope.$apply(function() {
                $scope.colNames = cols.map(function (col) {
                    return col.name;
                });
                $scope.tableData = rows;
            });


            console.log($scope.colNames);


        })
    }

    $scope.logItem = function (item) {
        console.log(item.name, 'was selected');
    };

    // The md-select directive eats keydown events for some quick select
    // logic. Since we have a search input here, we don't need that logic.
    //$element.find('input').on('keydown', function(ev) {
    //    ev.stopPropagation();
    //});
}