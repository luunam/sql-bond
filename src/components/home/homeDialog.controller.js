var format = require('string-format');

angular.module('homeModule')
  .controller('dialogController', dialogController);

function dialogController($scope, $mdDialog, $mdEditDialog, databaseConnectionService) {
  $scope.dialogTitle = databaseConnectionService.getDialogTitle();
  $scope.rowInfo = databaseConnectionService.getRowInfo();

  var connection = databaseConnectionService.getValue();

  $scope.execute = execute;
  $scope.cancel = cancel;

  $scope.hide = function () {
    $mdDialog.hide();
  };

  $scope.answer = function (answer) {
    $mdDialog.hide(answer);
  };

  function execute() {
    var cols = ' (';
    var vals = ' (';
    var count = 0;
    for (var k in $scope.rowInfo) {
      count++;
      cols += '`' + k + '`';
      vals += '"' + $scope.rowInfo[k] + '"';

      if (count < Object.keys($scope.rowInfo).length) {
        cols += ', ';
        vals += ', ';
      }
    }
    cols += ' )';
    vals += ' )';
    console.log(cols);
    console.log(vals);

    var query = format('INSERT INTO {0} {1} VALUES {2};',
      databaseConnectionService.getSelectedTable(), cols, vals);

    console.log(query);

    connection.query(query, function (err) {
      console.log(err);
    });
  }

  function cancel() {
    $mdDialog.cancel();
  }
}