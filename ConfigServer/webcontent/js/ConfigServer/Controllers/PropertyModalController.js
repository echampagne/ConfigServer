 var myApp = angular.module('myApp');
 // controller for adding a system to a cluster
myApp.controller('PropertyModalCtrl', function($scope, $modalInstance, property, properties){

  $scope.property = property;
  $scope.key = property.key;
  $scope.value = property.value;


  $scope.save = function(prop){
      newProp = {'key': $scope.key, 'value': $scope.value}
      properties.editProperty(prop, newProp);
      $modalInstance.close();
  };

  $scope.cancel = function(){
    $modalInstance.dismiss('cancel');
  };

});
