(function() {
  angular.module('sqlBond')
    .service('DatabaseConnectionService', DatabaseConnectionService);

  function DatabaseConnectionService() {
    this.getSelectedDatabase = function () {
      return this.selectedDatabase;
    };

    this.setSelectedDatabase = function (newValue) {
      this.selectedDatabase = newValue;
    };

    this.getSelectedTable = function () {
      return this.selectedTable;
    };

    this.setSelectedTable = function (newValue) {
      this.selectedTable = newValue;
    };

    this.getConnection = function () {
      return this.connection;
    };

    this.setConnection = function (newValue) {
      this.connection = newValue;
    };

    this.getDialogTitle = function () {
      return this.dialogTitle;
    };

    this.setDialogTitle = function (newValue) {
      this.dialogTitle = newValue;
    };

    this.getData = function () {
      return this.data;
    };

    this.setData = function (newValue) {
      this.data = newValue;
    };

    this.getRowInfo = function () {
      return this.rowInfo;
    };

    this.setRowInfo = function (newValue) {
      this.rowInfo = newValue;
    };
  }
})();