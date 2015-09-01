var myApp = angular.module('myApp');
// Navbar Controller
myApp.controller('NavCtrl', ['$scope', 'auth', function($scope, auth){
  $scope.isLoggedIn = auth.isLoggedIn;
  $scope.currentUser = auth.currentUser;
  $scope.logOut = auth.logOut;

  $scope.isAdmin = function(){
    var control_list = auth.getControl_list();
    if(control_list.indexOf('admin') != -1){
      return true;
    }
    return false;
  };
}]);
