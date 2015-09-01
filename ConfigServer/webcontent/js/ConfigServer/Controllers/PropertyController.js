var myApp = angular.module('myApp');
myApp.controller('PropertyCtrl', ['$scope', 'properties', 'auth', '$modal', '$timeout', '$log',
  function($scope, properties, auth, $modal, $timeout, $log){
    $scope.properties = properties.properties;
    $scope.sortType = 'key';
    $scope.sortReverse = false;
    $scope.search = '';
    $scope.isLoggedIn = auth.isLoggedIn;
    $scope.alertDisplayed = false;

    $scope.add = function(){
      if(!$scope.key || !$scope.value){ return; };
      if(!$scope.description){
        properties.addProperty({
          key: $scope.key,
          value: $scope.value
        });
      }
      if($scope.description){
        properties.addProperty({
          key: $scope.key,
          value: $scope.value,
          description: $scope.description
        });
        $scope.description='';
      }

      $scope.key='';
      $scope.value='';
    };

    $scope.remove = function(prop){
      var index = $scope.properties.indexOf(prop);
      $scope.properties.splice(index, 1);
      properties.deleteProperty(prop._id);
    };

     $scope.display = function(){
        $scope.alertDisplayed = true;
      $timeout(function() {
        $scope.alertDisplayed = false;
      }, 3000)
    };

    // function to open modal to add systems to a cluster
    $scope.open = function(size, _property){
      var modalInstance = $modal.open({
        templateUrl: 'editPropertyModal.html',
        controller: 'PropertyModalCtrl',
        size: size,
        resolve: {
          property: function() {
            return _property;
          },
          properties: function() {
            return properties;
          }
        }
      });

      modalInstance.result.then(function(){
        $scope.display();
      });
    };
}]);
