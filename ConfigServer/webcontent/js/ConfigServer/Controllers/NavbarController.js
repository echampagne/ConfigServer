var myApp = angular.module('myApp');
// Navbar Controller
myApp.controller('NavCtrl', ['$scope', 'auth', function($scope, auth){
  $scope.isLoggedIn = auth.isLoggedIn;
  $scope.currentUser = auth.currentUser;
  $scope.logOut = auth.logOut;
}]);
