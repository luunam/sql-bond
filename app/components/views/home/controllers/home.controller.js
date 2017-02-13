(function() {
  angular.module('sqlBond')
    .controller('HomeController', HomeController);

  var format = require('string-format');

  function HomeController($scope, $location, DatabaseConnectionService, $mdDialog, $mdEditDialog) {

    var connection = DatabaseConnectionService.getConnection();

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
    // We only want to show insertTooltip if users haven't chosen any table yet.
    $scope.insertTooltip = "Select a table first";
    $scope.updateAndDeleteTooltip = "Select a table first";

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
      DatabaseConnectionService.setSelectedDatabase($scope.selectedDatabase);
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
      DatabaseConnectionService.setSelectedTable($scope.selectedTable);
      connection.query("select * from " + $scope.selectedTable + ";", function (err, rows, cols) {
        if (err != null) {
          console.log(err);
        } else {
          $scope.$apply(function () {
            $scope.insertTooltip = "";
            $scope.updateAndDeleteTooltip = "please select a row";
            $scope.colNames = cols.map(function (col) {
              return col.name;
            });
            $scope.tableRows = rows;
          });
        }
      })
    }

    function insertData(ev) {
      console.log($scope.selectedTable);
      if ($scope.selectedTable != null && $scope.selectedTable != '') {
        DatabaseConnectionService.setDialogTitle("INSERT NEW ENTRY");

        var rowInfo = {};
        $scope.colNames.forEach(function (name) {
          rowInfo[name] = '';
        });
        DatabaseConnectionService.setRowInfo(rowInfo);

        $mdDialog.show({
          controller: dialogController,
          templateUrl: 'app/components/home/home-dialog.view.html',
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
        $scope.updateAndDeleteTooltip = '';

        console.log($scope.selected[0]);
        console.log($scope.selectedDatabase);
        DatabaseConnectionService.setDialogTitle("UPDATE TABLE ENTRY");
        DatabaseConnectionService.setRowInfo($scope.selected[0]);

        $mdDialog.show({
          controller: dialogController,
          templateUrl: 'app/components/home/home-dialog.view.html',
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
})();