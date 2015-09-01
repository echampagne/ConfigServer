var myApp = angular.module('myApp');
// controller for editing a cluster
myApp.controller('ClusterModalCtrl', function($scope, $modalInstance, cluster, clusters){
  $scope.cluster = cluster;
  $scope.clustername = cluster.name;
  $scope.clustertype = cluster.type;
  $scope.managerhostname = cluster.manager.hostname;
  $scope.manageripaddress = cluster.manager.ipaddress;
  $scope.manageralive = cluster.manager.alive;
  $scope.numCPU = cluster.manager.numCPU;
  $scope.RAM = cluster.manager.RAM;
  $scope.success = false;
  $scope.aliveOptions = [true, false];

  $scope.save = function(c_id){
    if ($scope.editClusterForm.$valid &&
        $scope.clustername &&
        $scope.clustertype &&
        $scope.managerhostname &&
        $scope.manageripaddress){
      newCluster = {name: $scope.clustername,
                    type: $scope.clustertype,
                    hostname: $scope.managerhostname,
                    ipaddress: $scope.manageripaddress,
                    alive: $scope.manageralive,
                   };
      clusters.editCluster(cluster, newCluster);
      $scope.success = true;
    }

    $modalInstance.close($scope.success);
  };

  $scope.cancel = function(){
    $modalInstance.dismiss('cancel');
  };

});
