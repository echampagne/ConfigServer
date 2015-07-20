var myApp = angular.module('myApp');
myApp.controller('PropertyCtrl', ['$scope', 'properties', 'auth', '$modal',
  function($scope, properties, auth, $modal, $log){
    $scope.properties = properties.properties;
    $scope.sortType = 'key';
    $scope.sortReverse = false;
    $scope.search = '';
    $scope.isLoggedIn = auth.isLoggedIn;


    $scope.add = function(){
      if(!$scope.key || !$scope.value){ return; };

      properties.addProperty({
        key: $scope.key,
        value: $scope.value
      });

      $scope.key='';
      $scope.value='';

    };

    $scope.remove = function(prop){
      var index = $scope.properties.indexOf(prop);
      $scope.properties.splice(index, 1);
      properties.deleteProperty(prop._id);
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
      });
    };
}]);
