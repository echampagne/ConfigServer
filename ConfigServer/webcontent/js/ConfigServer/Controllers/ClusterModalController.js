var myApp = angular.module('myApp');
// controller for editing a cluster
myApp.controller('ClusterModalCtrl', function($scope, $modalInstance, cluster, clusters){
  $scope.cluster = cluster;
  $scope.clustername = cluster.name;
  $scope.clustertype = cluster.type;
  $scope.managerhostname = cluster.manager.hostname;
  $scope.manageripaddress = cluster.manager.ipaddress;
  $scope.manageralive = cluster.manager.alive;


  $scope.save = function(c_id){
      newCluster = {name: $scope.clustername,
                    type: $scope.clustertype,
                    hostname: $scope.managerhostname,
                    ipaddress: $scope.manageripaddress,
                    alive: $scope.manageralive,
                   };
      clusters.editCluster(cluster, newCluster);
      $modalInstance.close();
  };

  $scope.cancel = function(){
    $modalInstance.dismiss('cancel');
  };

});
