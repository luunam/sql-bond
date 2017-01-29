var format = require('string-format');

angular.module('homeModule', ['ngMaterial', 'ngRoute', 'md.data.table', 'ngMdIcons'])
    .config(['$mdThemingProvider', function ($mdThemingProvider) {
        'use strict';

        $mdThemingProvider.theme('default')
            .primaryPalette('blue');
    }])
    .service('homeService', homeService)
    .controller('homeController', homeController)
    .controller('dialogController', dialogController);

function homeService() {
    this.setConnection = setConnection;
    this.getConnection = getConnection;
    this.setDialogTitle = setDialogTitle;
    this.getDialogTitle = getDialogTitle;

    function setConnection(conn) {
        this.connection = conn;
    }

    function getConnection() {
        return this.connection;
    }

    function setDialogTitle(title) {
        this.title = title
    }

    function getDialogTitle() {
        return this.dialogTitle;
    }

    this.getValue = function() {
        return this.myValue;
    };

    this.setValue = function(newValue) {
        this.myValue = newValue;
    }
}

function homeController($scope, $location, homeService, $mdDialog) {

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

    $scope.tableName = '';
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

    function createData(ev) {
        console.log($scope.tableName);
        if (true) {

            homeService.setValue("CREATE NEW TABLE ENTRY");
            $mdDialog.show({
                controller: dialogController,
                templateUrl: 'src/components/home/homeDialog.html',
                parent: angular.element(document.body),
                targetEvent: ev,
                clickOutsideToClose: false,
                fullscreen: $scope.customFullscreen // Only for -xs, -sm breakpoints.
            }).then(function(answer) {
                    $scope.status = 'You said the information was "' + answer + '".';
                }, function() {
                    $scope.status = 'You cancelled the dialog.';
                });
        }

    }

    function updateData(ev) {
        if ($scope.selected.length > 0) {
            homeService.setValue("UPDATE TABLE ENTRY");
            $mdDialog.show({
                controller: dialogController,
                templateUrl: 'src/components/home/homeDialog.html',
                parent: angular.element(document.body),
                targetEvent: ev,
                clickOutsideToClose: false,
                fullscreen: $scope.customFullscreen // Only for -xs, -sm breakpoints.
            }).then(function(answer) {
                $scope.status = 'You said the information was "' + answer + '".';
            }, function() {
                $scope.status = 'You cancelled the dialog.';
            });
        }
    }

    function deleteData() {

    }

    // The md-select directive eats keydown events for some quick select
    // logic. Since we have a search input here, we don't need that logic.
    //$element.find('input').on('keydown', function(ev) {
    //    ev.stopPropagation();
    //});
}

function dialogController($scope, $mdDialog, homeService) {
    $scope.dialogTitle = homeService.getValue();

    $scope.hide = function () {
        $mdDialog.hide();
    };

    $scope.cancel = function () {
        $mdDialog.cancel();
    };

    $scope.answer = function (answer) {
        $mdDialog.hide(answer);
    };
}