angular
    .module("mainApp", ['ngMaterial', ''])
    .service()
    .controller("mainController", mainController);

function mainController($scope, $element, $window) {
    $scope.databases = ['Corn' ,'Onions' ,'Kale' ,'Arugula' ,'Peas', 'Zucchini'];
    $scope.searchTerm = '';
    $scope.selectedDatabase = '';
    $scope.tables = [
        { name: 'Test table 1' },
        { name: 'Test table 2' }
    ];

    $scope.logout = logout;
    $scope.clearSearchTerm = clearSearchTerm;

    function clearSearchTerm() {
        $scope.searchTerm = '';
        console.log($scope.selectedDatabase);
    }

    function logout() {
        $window.location.href = '../../index.html';
    }
    // The md-select directive eats keydown events for some quick select
    // logic. Since we have a search input here, we don't need that logic.
    $element.find('input').on('keydown', function(ev) {
        ev.stopPropagation();
    });
}