var myApp = angular.module('myApp');
 // controller for adding a system to a cluster
myApp.controller('PropertyModalCtrl', function($scope, $modalInstance, property, properties){
  $scope.property = property;
  $scope.key = property.key;
  $scope.success = false;

  if(typeof property.value === 'object' ){
    $scope.value = JSON.stringify(property.value);
  }
  else{
     $scope.value = property.value;
  }
  $scope.description = property.description;
  $scope.save = function(prop){
      if(!$scope.description){
        newProp = {'key': $scope.key, 'value': $scope.value}
      }
      if($scope.description){
        newProp = {'key': $scope.key, 'value': $scope.value, 'description' : $scope.description}
      }
      properties.editProperty(prop, newProp);
      $scope.success = true;
      $modalInstance.close($scope.success);
  };

  $scope.cancel = function(){
    $modalInstance.dismiss('cancel');
  };

});
