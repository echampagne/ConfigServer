var myApp = angular.module('myApp');
myApp.controller('deploystreamModalController', ['$scope', '$modalInstance', 'clusters',
  function($scope, clusters){
    console.log(clusters);
    $scope.deploydata = {message: clusters.deploydata.output};

    $scope.$watch(function() { return clusters.deploydata.output },
      function(newVal){
        $scope.deploydata.message = newVal;
    });


    $scope.cancel = function(){
      $modalInstance.dismiss('cancel');
      console.log(clusters.deploydata.output);
      console.log($scope.deploydata.message);
    };
}]);
