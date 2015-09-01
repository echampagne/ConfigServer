var myApp = angular.module('myApp');
myApp.controller('SystemModalCtrl', function($scope, $modalInstance, cluster, clusters){
  $scope.cluster = cluster;
  $scope.success = false;
  $scope.aliveOptions = [true, false];

  $scope.save = function(cluster){
      if ($scope.addSystemForm.$valid &&
          $scope.systemhostname &&
          $scope.systemNumCPU &&
          $scope.systemRAM &&
          ($scope.systemalive != null)){

        newSys = {hostname: $scope.systemhostname,
                  ipaddress: $scope.systemipaddress,
                  alive: $scope.systemalive,
                  numCPU: $scope.systemNumCPU,
                  RAM: $scope.systemRAM
                 };
        clusters.createSystem(cluster, newSys);
        $scope.success = true;
      }
      $modalInstance.close($scope.success);
  };

  $scope.cancel = function(){
    $modalInstance.dismiss('cancel');
  };

});
