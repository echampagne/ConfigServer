var myApp = angular.module('myApp')
// controller for cluster list
myApp.controller('MainCtrl', ['$scope', 'clusters', 'auth', '$modal',
  function($scope, clusters, auth, $modal, $log){
    $scope.clusters = clusters.clusters;
    $scope.isCollapsed = true;
    $scope.addform = false;
    $scope.sortType = 'name'; // set the default sort type
    $scope.sortReverse  = false;  // set the default sort order
    $scope.isLoggedIn = auth.isLoggedIn;
    $scope.manageralive = true;


    // add a cluster
    $scope.addCluster = function(){
      if(!$scope.name || !$scope.managerhostname || !$scope.manageripaddress || !$scope.type ){ return; }

      clusters.createCluster({name: $scope.name,
                              type: $scope.type,
                              hostname: $scope.managerhostname,
                              ipaddress: $scope.manageripaddress,
                              alive: $scope.manageralive
                              });

      $scope.name='';
      $scope.type='';
      $scope.managerhostname='';
      $scope.manageripaddress='';
      $scope.manageralive='';
    };

    // remove a cluster
    $scope.remove = function(item){
      var index = $scope.clusters.indexOf(item);
      $scope.clusters.splice(index, 1);
      clusters.deleteCluster(item.name);
    };

    $scope.removeSystem = function(cluster, sys){
      var c_index = $scope.clusters.indexOf(cluster);
      var s_index = $scope.clusters[c_index].systems.indexOf(sys);
      $scope.clusters[c_index].systems.splice(s_index, 1);
      clusters.deleteSystem(cluster.name, sys._id);
    };


    $scope.determineProgress = function(value){

      if (value < 25) {
        return 'success';
      } else if (value < 50) {
        return 'info';
      } else if (value < 75) {
        return 'warning';
      } else {
        return 'danger';
      }
    }

    $scope.determineMachineStatus = function(alive, low_resources){
      if(alive && low_resources)
        return true;
      return false;
    }

    // function to open modal to add systems to a cluster
    $scope.open = function(size, _cluster){
      var modalInstance = $modal.open({
        templateUrl: 'addSystemModal.html',
        controller: 'SystemModalCtrl',
        size: size,
        resolve: {
          cluster: function() {
            return _cluster;
          },
          clusters: function() {
            return clusters;
          }
        }
      });

      modalInstance.result.then(function(){
      });
    };


    // function to open modal to edit cluster
     $scope.openEdit = function(size, _cluster){
      var modalInstance = $modal.open({
        templateUrl: 'editClusterModal.html',
        controller: 'ClusterModalCtrl',
        size: size,
        resolve: {
          cluster: function() {
            return _cluster;
          },
          clusters: function() {
            return clusters;
          }
        }
      });

      modalInstance.result.then(function(){
      });
    };

    // function to open modal to add systems to a cluster
    $scope.openEditSystem = function(size, _cluster, _system){
      var modalInstance = $modal.open({
        templateUrl: 'editSystemModal.html',
        controller: 'EditSystemModalCtrl',
        size: size,
        resolve: {
          cluster: function() {
            return _cluster;
          },
          clusters: function() {
            return clusters;
          },
          system: function() {
            return _system;
          }
        }
      });

      modalInstance.result.then(function(){
      });
    };
  }]);
