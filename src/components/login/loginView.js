var mysql = require('mysql');

angular.module('loginMenuModule', ['ngMaterial', 'ngRoute', 'homeModule'])
    .service('loginService', loginService)
    .controller('loginMenuController', loginMenuController);

function loginService(databaseConnectionService) {
    this.getValue = function() {
        return databaseConnectionService.getValue();
    };

    this.setValue = function(val) {
        databaseConnectionService.setValue(val);
    }
}

function loginMenuController ($scope, $location, $rootScope, loginService) {
    console.log('SUCCESS');

    $scope.connections= [
        //{ 'name': 'Test connection 1' },
        //{ 'name': 'Test connection 2' }
    ];

    $scope.connection = {
        name: 'test',
        host: '127.0.0.1',
        username: process.env.MYSQL_USER,
        password: process.env.MYSQL_PASSWORD
    };

    $scope.errorMessage = '';
    $scope.addConnection = addConnection;
    $scope.handleConnection = handleConnection;
    $scope.clearInputFields = clearInputFields;

    function addConnection(connection, callback) {
        var newConnection = {
            name: connection.name,
            username: connection.username,
            password: connection.password,
            host: connection.host,
            port: connection.port
        };

        $scope.connection = {};

        var conn = mysql.createConnection({
            host     : newConnection.host,
            user     : newConnection.username,
            password : newConnection.password,
            multipleStatements: true
        });

        conn.connect(function(err) {
            callback(err, conn);
        });
    }

    function handleConnection(err, newConnection) {
        if (err != null) {
            console.log("ERROR: " + err);
            $scope.$apply(function() {
                $scope.errorMessage = 'Connect Fail!';
            });
        } else {
            console.log("CONNECT SUCCESSFUL");
            $scope.connections.push(newConnection);

            $rootScope.$apply(function() {
                $location.path('/home');
                loginService.setValue(newConnection);
                console.log($location.path());
            });
        }
    }

    function clearInputFields() {
        $scope.connection = {};
    }
}