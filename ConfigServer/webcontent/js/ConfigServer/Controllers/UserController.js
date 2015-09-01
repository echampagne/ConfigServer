var myApp = angular.module('myApp');
myApp.controller('UserController', ['$scope', 'auth', 'user_control',
  function($scope, auth, user_control){

    $scope.username = '';
    $scope.user = user_control.user;
    $scope.showSearch = false;
    $scope.showOptions = true;
    $scope.showAdd = false;
    $scope.control = '';
    $scope.control_options = ['admin', 'edit', 'delete', 'add'];

    $scope.findUser = function(username){
      user_control.getUser(username).then(function(res){
        console.log(res);
        $scope.showSearch=true;
      });
    };

    $scope.addControl = function(username, control){
      user_control.addControl(username, control);
    };

    $scope.removeControl = function(username, control){
      user_control.removeControl(username, control);
    }

}]);
