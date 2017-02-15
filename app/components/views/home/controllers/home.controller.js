// TODO: Move query builder to DatabaseConnectionService
// TODO: Handle cases when table has 0 or multiple columns as primary key
// TODO: Show SQL query errors to users
// TODO: Remove all console logs
// TODO: Implement Help Button

(function() {
  angular.module('sqlBond')
    .controller('HomeController', HomeController)
    .controller('InsertDialogController', InsertDialogController)
    .controller('UpdateDialogController', UpdateDialogController);

  var format = require('string-format');

  function HomeController($scope, $location, DatabaseConnectionService,
                          $mdDialog, $mdEditDialog, HomeDialogService) {

    var vm = this;

    var connection = DatabaseConnectionService.getConnection();

    connection.on('error', function (err) {
      console.log('some thing bad happened');
      console.log(err.code); // 'ER_BAD_DB_ERROR'
    });

    connection.query('SHOW DATABASES;', function (err, rows, cols) {
      if (err !== null) {
        console.log('ERROR: ' + err);
      } else {
        vm.databases = rows.map(function (row) {
          return row.Database;
        });
      }
    });

    vm.searchTerm = '';

    // The database that user selects
    vm.selectedDatabase = '';

    // The list of row that user selects
    vm.selected = [];

    // Name of the table that user selects
    vm.selectedTable = '';
    vm.primaryKey = '';

    vm.tables = [];
    vm.colNames = [];
    vm.tableRows = [];

    //============================== FUNCTION DECLARATION =============================
    vm.showData = showData;
    // Functions that handle 4 footer buttons
    vm.insertData = insertData;
    vm.updateData = updateData;
    vm.deleteData = deleteData;
    vm.refreshData = refreshData;
    vm.showHelp = showHelp;

    // Functions that handle user click on 1 cell
    vm.clickCell = clickCell;

    // Logout function
    vm.logout = logout;

    vm.clearSearchTerm = clearSearchTerm;

    // This function triggers when user chooses a database
    vm.changeDatabase = changeDatabase;

    // This function triggers when user select a table
    vm.selectTable = selectTable;

    // Tooltip that is shown when user hovers on 4 footer buttons
    // We only want to show insertTooltip if users haven't chosen any table yet.
    vm.insertTooltip = "Select a table first";
    vm.updateAndDeleteTooltip = "Select a table first";

    //================================== IMPLEMENTATION =================================
    function clearSearchTerm() {
      vm.searchTerm = '';
    }

    function logout() {
      connection.end();
      $location.path('/');
    }

    function changeDatabase() {
      console.log("HERE");
      vm.selected = [];
      DatabaseConnectionService.setSelectedDatabase(vm.selectedDatabase);

      var query = format('use {0};', vm.selectedDatabase);
      console.log(query);
      connection.query(query, function (err, rows, cols) {
        if (err !== null) {
          console.log('ERROR: ' + err);
        } else {
          connection.query("show tables;", function (err, rows, cols) {
            if (err !== null) {
              console.log('ERROR: ' + err);
            } else {
              vm.tables = rows.map(function (table) {
                return {name: table['Tables_in_' + vm.selectedDatabase]};
              });
            }
          });
        }
      });
    }

    function selectTable(tableIdx) {
      vm.selected = [];

      var tableName = vm.tables[tableIdx].name;

      vm.selectedTable = tableName;

      // Get table's primary key
      connection.query(format("show index from {0} where Key_name='PRIMARY'", tableName), function(err, rows, cols) {
        if (err !== null) {
          console.log(err);
        } else {
          vm.primaryKey = rows[0]['Column_name'];
          var tableInfo = {
            name: tableName,
            primaryKey: rows[0]['Column_name']
          };

          DatabaseConnectionService.setSelectedTable(tableInfo);
        }
      });

      showData(tableName);
    }

    function showData(tableName) {
      vm.selected = [];
      connection.query("select * from " + tableName + ";", function (err, rows, cols) {
        if (err !== null) {
          console.log(err);
        } else {
          $scope.$apply(function () {
            vm.insertTooltip = "";
            vm.updateAndDeleteTooltip = "please select a row";
            vm.colNames = cols.map(function (col) {
              return col.name;
            });
            vm.tableRows = rows;
          });
        }
      });
    }

    function insertData(ev) {
      console.log(vm.selectedTable);
      if (vm.selectedTable !== null && vm.selectedTable != '') {
        HomeDialogService.setDialogTitle("INSERT NEW ENTRY");

        var rowInfo = {};
        vm.colNames.forEach(function (name) {
          rowInfo[name] = '';
        });
        DatabaseConnectionService.setRowInfo(angular.copy(rowInfo));

        $mdDialog.show({
          controller: 'InsertDialogController',
          controllerAs: 'model',
          templateUrl: 'components/views/home/templates/home-dialog.view.html',
          parent: angular.element(document.body),
          targetEvent: ev,
          clickOutsideToClose: false,
          fullscreen: vm.customFullscreen // Only for -xs, -sm breakpoints.
        }).then(function () {
          console.log('You hide the dialog');
          showData(vm.selectedTable);
        }, function () {
          console.log('You cancelled the dialog.');
        });
      }

    }

    function updateData(ev) {
      if (vm.selected.length > 0) {
        vm.updateAndDeleteTooltip = '';

        HomeDialogService.setDialogTitle("UPDATE TABLE ENTRY");
        DatabaseConnectionService.setRowInfo(angular.copy(vm.selected[0]));

        $mdDialog.show({
          controller: 'UpdateDialogController',
          controllerAs: 'model',
          templateUrl: 'components/views/home/templates/home-dialog.view.html',
          parent: angular.element(document.body),
          targetEvent: ev,
          clickOutsideToClose: false,
          fullscreen: vm.customFullscreen // Only for -xs, -sm breakpoints.
        }).then(function (answer) {
          console.log('You hide the dialog');
          showData(vm.selectedTable);
        }, function () {
          console.log('You cancelled the dialog.');
        });
      }
    }

    function deleteData() {
      var condition = format('{0}="{1}"', vm.primaryKey, vm.selected[0][vm.primaryKey]);
      var query = format("DELETE FROM {0} WHERE {1}", vm.selectedTable, condition);

      connection.query(query, function(err) {
        if (err) {
          console.log(err);
        } else {
          showData(vm.selectedTable);
        }
      });
    }

    function refreshData() {
      showData(vm.selectedTable);
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

  function InsertDialogController($mdDialog, DatabaseConnectionService, HomeDialogService) {
    var vm = this;

    vm.dialogTitle = HomeDialogService.getDialogTitle();
    vm.rowInfo = DatabaseConnectionService.getRowInfo();
    vm.connection = DatabaseConnectionService.getConnection();
    vm.tableInfo = DatabaseConnectionService.getSelectedTable();

    vm.execute = execute;
    vm.cancel = cancel;
    vm.disablePrimaryKey = disablePrimaryKey;

    function execute() {
      var cols = ' (';
      var vals = ' (';
      var count = 0;
      for (var k in vm.rowInfo) {
        count++;
        cols += '`' + k + '`';
        vals += '"' + vm.rowInfo[k] + '"';

        if (count < Object.keys(vm.rowInfo).length) {
          cols += ', ';
          vals += ', ';
        }
      }
      cols += ' )';
      vals += ' )';

      var query = format('INSERT INTO {0} {1} VALUES {2};',
        vm.tableInfo.name, cols, vals);

      console.log(query);

      vm.connection.query(query, function (err) {
        console.log('ERROR: ' + err);
        $mdDialog.hide();
      });
    }

    function cancel() {
      $mdDialog.cancel();
    }

    function disablePrimaryKey(columnName) {
      return false;
    }
  }

  function UpdateDialogController($mdDialog, DatabaseConnectionService, HomeDialogService) {
    var vm = this;

    vm.dialogTitle = HomeDialogService.getDialogTitle();
    vm.rowInfo = DatabaseConnectionService.getRowInfo();
    vm.connection = DatabaseConnectionService.getConnection();
    vm.tableInfo = DatabaseConnectionService.getSelectedTable();

    vm.execute = execute;
    vm.cancel = cancel;
    vm.disablePrimaryKey = disablePrimaryKey;

    var primaryKey = vm.tableInfo.primaryKey;

    function cancel() {
      $mdDialog.cancel();
    }

    function execute() {
      // Build UPDATE query
      // Essentially we want our update query to look like this:
      // UPDATE table_name SET field1=value1, field2=value2 ... WHERE primary_key=value
      var setStatement = '';
      var count = 0;
      for (var k in vm.rowInfo) {
        count++;
        if (k != primaryKey && k != '$$hashKey') {
          setStatement += '`' + k + '`="' + vm.rowInfo[k] + '"';

          if (count < Object.keys(vm.rowInfo).length) {
            setStatement += ', ';
          }
        }
      }

      var condition = format('{0}="{1}"', primaryKey, vm.rowInfo[primaryKey]);

      var query = format('UPDATE {0} SET {1} WHERE {2};',
        vm.tableInfo.name, setStatement, condition);

      console.log(query);

      vm.connection.query(query, function (err) {
        console.log('ERROR: ' + err);
        $mdDialog.hide();
      });
    }

    function disablePrimaryKey(columnName) {
      // Since this is batch update we don't want user to change primary
      // key value, else we don't know how to update table's entry
      return columnName === vm.tableInfo.primaryKey;
    }
  }
})();