var myApp = angular.module('myApp');
// controller for adding a system to a cluster
myApp.controller('EditSystemModalCtrl', function($scope, $modalInstance, cluster, clusters, system){

  $scope.cluster = cluster;
  $scope.system =  system;
  $scope.systemhostname = system.hostname;
  $scope.systemipaddress = system.ipaddress;
  $scope.systemalive = system.alive;


  $scope.save = function(cluster, sys){
      newSys = {hostname: $scope.systemhostname,
                ipaddress: $scope.systemipaddress,
                alive: $scope.systemalive,
                mem_percent_used: sys.mem_percent_used,
                disk_percent_used: sys.disk_percent_used,
                low_resources: sys.low_resources
               };
      clusters.editSystem(cluster, sys, newSys);
      $modalInstance.close();
  };

  $scope.cancel = function(){
    $modalInstance.dismiss('cancel');
  };

});
