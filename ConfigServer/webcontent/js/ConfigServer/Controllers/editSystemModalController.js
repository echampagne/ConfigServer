var myApp = angular.module('myApp');
// controller for adding a system to a cluster
myApp.controller('EditSystemModalCtrl', function($scope, $modalInstance, cluster, clusters, system){

  $scope.cluster = cluster;
  $scope.system =  system;
  $scope.systemhostname = system.hostname;
  $scope.systemipaddress = system.ipaddress;
  $scope.systemalive = system.alive;
  $scope.numCPU = system.numCPU;
  $scope.RAM = system.RAM;
  $scope.success = false;
  $scope.aliveOptions = [true, false];


  $scope.save = function(cluster, sys){
    if ($scope.editSystemForm.$valid &&
        $scope.systemhostname &&
        $scope.systemipaddress){
      newSys = {hostname: $scope.systemhostname,
                ipaddress: $scope.systemipaddress,
                alive: $scope.systemalive,
                mem_percent_used: sys.mem_percent_used,
                disk_percent_used: sys.disk_percent_used,
                low_resources: sys.low_resources,
                suspended: sys.suspended
               };
      clusters.editSystem(cluster, sys, newSys);
      $scope.success = true;
    }
  };
    $modalInstance.close($scope.success);

  $scope.cancel = function(){
    $modalInstance.dismiss('cancel');
  };

});
