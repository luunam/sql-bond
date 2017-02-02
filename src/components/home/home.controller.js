angular.module('homeModule')
  .controller('homeController', homeController);

var format = require('string-format');

function homeController($scope, $location, databaseConnectionService, $mdDialog, $mdEditDialog) {

  var connection = databaseConnectionService.getValue();

  connection.on('error', function (err) {
    console.log('some thing bad happened');
    console.log(err.code); // 'ER_BAD_DB_ERROR'
  });

  connection.query('SHOW DATABASES;', function (err, rows, cols) {
    if (err != null) {
      console.log('ERROR: ' + err);
    } else {
      $scope.databases = rows.map(function (row) {
        return row.Database;
      });
    }
  });

  $scope.searchTerm = '';

  // The database that user selects
  $scope.selectedDatabase = '';

  // The list of row that user selects
  $scope.selected = [];

  // Name of the table that user selects
  $scope.selectedTable = '';

  $scope.tables = [];
  $scope.colNames = [];
  $scope.tableRows = [];

  // Functions that handle 4 footer buttons
  $scope.insertData = insertData;
  $scope.updateData = updateData;
  $scope.deleteData = deleteData;
  $scope.refreshData = refreshData;
  $scope.showHelp = showHelp;

  // Functions that handle user click on 1 cell
  $scope.clickCell = clickCell;

  // Logout function
  $scope.logout = logout;

  $scope.clearSearchTerm = clearSearchTerm;

  // This function triggers when user chooses a database
  $scope.changeDatabase = changeDatabase;

  // This function triggers when user select a table
  $scope.selectTable = selectTable;

  // Tooltip that is shown when user hovers on 4 footer buttons
  // We only want to show tooltip if users haven't chosen any table yet.
  $scope.tooltip = "Select a table first";

  //================================== IMPLEMENTATION =================================
  function clearSearchTerm() {
    $scope.searchTerm = '';
  }

  function logout() {
    connection.end();
    $location.path('/');
  }

  function changeDatabase() {
    $scope.selected = [];
    databaseConnectionService.setSelectedDatabase($scope.selectedDatabase);
    connection.query(format('use {};', $scope.selectedDatabase), function (err, rows, cols) {
      if (err != null) {
        console.log('ERROR: ' + err);
      } else {
        connection.query("show tables;", function (err, rows, cols) {
          $scope.tables = rows.map(function (table) {
            return {name: table['Tables_in_' + $scope.selectedDatabase]}
          })
        });
      }
    })

  }

  function selectTable(tableIdx) {
    $scope.selected = [];
    $scope.selectedTable = $scope.tables[tableIdx].name;
    databaseConnectionService.setSelectedTable($scope.selectedTable);
    connection.query("select * from " + $scope.selectedTable + ";", function (err, rows, cols) {
      $scope.$apply(function () {
        $scope.tooltip = "";
        $scope.colNames = cols.map(function (col) {
          return col.name;
        });
        $scope.tableRows = rows;
      });
    })
  }

  function insertData(ev) {
    console.log($scope.selectedTable);
    if (true) {
      databaseConnectionService.setDialogTitle("INSERT NEW ENTRY");

      var rowInfo = {};
      $scope.colNames.forEach(function (name) {
        rowInfo[name] = '';
      });
      databaseConnectionService.setRowInfo(rowInfo);

      $mdDialog.show({
        controller: dialogController,
        templateUrl: 'src/components/home/homeDialog.html',
        parent: angular.element(document.body),
        targetEvent: ev,
        clickOutsideToClose: false,
        fullscreen: $scope.customFullscreen // Only for -xs, -sm breakpoints.
      }).then(function (answer) {
        $scope.status = 'You said the information was "' + answer + '".';
      }, function () {
        $scope.status = 'You cancelled the dialog.';
      });
    }

  }

  function updateData(ev) {
    if ($scope.selected.length > 0) {
      databaseConnectionService.setValue("UPDATE TABLE ENTRY");
      $mdDialog.show({
        controller: dialogController,
        templateUrl: 'src/components/home/homeDialog.html',
        parent: angular.element(document.body),
        targetEvent: ev,
        clickOutsideToClose: false,
        fullscreen: $scope.customFullscreen // Only for -xs, -sm breakpoints.
      }).then(function (answer) {
        $scope.status = 'You said the information was "' + answer + '".';
      }, function () {
        $scope.status = 'You cancelled the dialog.';
      });
    }
  }

  function deleteData() {

  }

  function refreshData() {

  }

  function showHelp() {

  }

  function clickCell(event, val) {
    event.stopPropagation(); // in case autoselect is enabled

    var editDialog = {
      modelValue: val,
      placeholder: 'Insert value',
      targetEvent: event,
      title: 'Insert Value',
      validators: {}
    };

    var promise = $mdEditDialog.small(editDialog);


    promise.then(function (ctrl) {
      var input = ctrl.getInput();

      input.$viewChangeListeners.push(function () {
        //input.$setValidity('test', val !== 'test');
      });
    });
  }

  // The md-select directive eats keydown events for some quick select
  // logic. Since we have a search input here, we don't need that logic.
  //$element.find('input').on('keydown', function(ev) {
  //    ev.stopPropagation();
  //});
}