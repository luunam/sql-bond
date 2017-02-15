(function() {
  var mysql = require('mysql');

  angular.module('sqlBond')
    .controller('LoginController', LoginController);

  function LoginController($scope, $location, $rootScope, DatabaseConnectionService) {
    $scope.connections = [
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
      var newConnection = angular.copy(connection);

      $scope.connection = {};

      var conn = mysql.createConnection({
        host: newConnection.host,
        user: newConnection.username,
        password: newConnection.password,
        multipleStatements: true
      });

      conn.connect(function (err) {
        callback(err, conn);
      });
    }

    function handleConnection(err, newConnection) {
      if (err !== null) {
        console.log("ERROR: " + err);
        $scope.$apply(function () {
          $scope.errorMessage = 'Connect Fail!';
        });
      } else {
        $scope.connections.push(newConnection);

        $rootScope.$apply(function () {
          $location.path('/home');
          DatabaseConnectionService.setConnection(newConnection);
          console.log($location.path());
        });
      }
    }

    function clearInputFields() {
      $scope.connection = {};
    }
  }
})();