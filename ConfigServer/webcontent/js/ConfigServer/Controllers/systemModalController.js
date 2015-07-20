var myApp = angular.module('myApp');
myApp.controller('SystemModalCtrl', function($scope, $modalInstance, cluster, clusters){
  $scope.cluster = cluster;

  $scope.save = function(cluster){
      newSys = {hostname: $scope.systemhostname,
                ipaddress: $scope.systemipaddress,
                alive: $scope.systemalive
               };
      clusters.createSystem(cluster, newSys);
      $modalInstance.close();
  };

  $scope.cancel = function(){
    $modalInstance.dismiss('cancel');
  };

});
