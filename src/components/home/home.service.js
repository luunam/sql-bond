angular.module('homeModule')
  .service('databaseConnectionService', databaseConnectionService);

function databaseConnectionService() {
  this.connection = {};

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

  this.getValue = function () {
    return this.connection;
  };

  this.setValue = function (newValue) {
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