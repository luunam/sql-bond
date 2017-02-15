(function() {
  angular.module('sqlBond')
    .controller('HomeController', HomeController)
    .controller('HomeDialogController', HomeDialogController);

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
      if (err != null) {
        console.log('ERROR: ' + err);
      } else {
        vm.databases = rows.map(function (row) {
          return row.Database;
        });
      }
    });

    vm.searchTerm = '';

    // The database that user selects
    //vm.selectedDatabase = '';

    vm.selectedDatabase = '';

    // The list of row that user selects
    vm.selected = [];

    // Name of the table that user selects
    vm.selectedTable = '';

    vm.tables = [];
    vm.colNames = [];
    vm.tableRows = [];

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
        if (err != null) {
          console.log('ERROR: ' + err);
        } else {
          connection.query("show tables;", function (err, rows, cols) {
            vm.tables = rows.map(function (table) {
              return {name: table['Tables_in_' + vm.selectedDatabase]}
            })
          });
        }
      });
    }

    function selectTable(tableIdx) {
      vm.selected = [];

      var tableName = vm.tables[tableIdx].name;

      vm.selectedTable = tableName;
      //DatabaseConnectionService.setSelectedTable($scope.selectedTable);

      connection.query(format("show index from {0} where Key_name='PRIMARY'", tableName), function(err, rows, cols) {
        if (err != null) {
          console.log(err);
        } else {
          console.log(rows[0]['Column_name']);
          console.log(cols);
          DatabaseConnectionService.setSelectedTable(tableName);
        }
      });

      showData(tableName);
    }

    function showData(tableName) {
      connection.query("select * from " + tableName + ";", function (err, rows, cols) {
        if (err != null) {
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
      if (vm.selectedTable != null && vm.selectedTable != '') {
        HomeDialogService.setDialogTitle("INSERT NEW ENTRY");

        var rowInfo = {};
        vm.colNames.forEach(function (name) {
          rowInfo[name] = '';
        });
        DatabaseConnectionService.setRowInfo(rowInfo);

        $mdDialog.show({
          controller: 'HomeDialogController',
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

        console.log(vm.selected[0]);
        console.log(vm.selectedDatabase);
        HomeDialogService.setDialogTitle("UPDATE TABLE ENTRY");
        DatabaseConnectionService.setRowInfo(vm.selected[0]);

        $mdDialog.show({
          controller: HomeDialogController,
          templateUrl: 'components/views/home/templates/home-dialog.view.html',
          parent: angular.element(document.body),
          targetEvent: ev,
          clickOutsideToClose: false,
          fullscreen: vm.customFullscreen // Only for -xs, -sm breakpoints.
        }).then(function (answer) {
          console.log('You hide the dialog');
        }, function () {
          console.log('You cancelled the dialog.');
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

  function HomeDialogController($mdDialog, DatabaseConnectionService, HomeDialogService) {
    var vm = this;

    vm.dialogTitle = HomeDialogService.getDialogTitle();
    vm.rowInfo = DatabaseConnectionService.getRowInfo();
    vm.connection = DatabaseConnectionService.getConnection();

    vm.execute = execute;
    vm.cancel = cancel;

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
      console.log(cols);
      console.log(vals);

      var query = format('INSERT INTO {0} {1} VALUES {2};',
        DatabaseConnectionService.getSelectedTable(), cols, vals);

      console.log(query);

      vm.connection.query(query, function (err) {
        console.log('ERROR: ' + err);
        $mdDialog.hide();
      });
    }

    function cancel() {
      $mdDialog.cancel();
    }
  }
})();