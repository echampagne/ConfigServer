var myApp = angular.module('myApp')
// controller for cluster list
myApp.controller('MainCtrl', ['$scope', 'clusters', 'auth', '$modal', '$timeout', '$log', '$sce', '$interval',
  function($scope, clusters, auth, $modal, $timeout, $log, $sce, $interval){
    $scope.clusters = clusters.clusters;
    $scope.deploydata = {message: clusters.deploydata.output};
    $scope.isCollapsed = true;
    $scope.addform = false;
    $scope.clusterview = true;
    $scope.sortType = 'name'; // set the default sort type
    $scope.sortReverse  = false;  // set the default sort order
    $scope.isLoggedIn = auth.isLoggedIn;
    $scope.manageralive = true;
    $scope.alertDisplayed = false;
    $scope.getData = clusters.getDeployData;
    $scope.suspendStyle={};

    // Try to connect client to socket at 192.168.1.8:8082
    var socket = io.connect('http://192.168.1.17:8082', {
      'timeout': 5000,
    });

    // On connection failure, try to connect to VPN address
    socket.on('connect_timeout', function(){
      console.log('Connect failed on 192.168.1.17:8082, trying 10.8.1.0:8082');
      socket = io.connect('http://10.8.1.0:8082', {
        'timeout': 5000
      });
    });
    // On 'update' message, sent from heartbeat endpoint, update the view
    socket.on('update', function(){
      console.log('update received');
      clusters.getAll();
    });


    // add a cluster
    $scope.addCluster = function(){
      if(!$scope.name || !$scope.managerhostname || !$scope.manageripaddress || !$scope.type || !$scope.managerNumCPU || !$scope.managerRAM ){ return; }

      clusters.createCluster({name: $scope.name,
                              type: $scope.type,
                              hostname: $scope.managerhostname,
                              ipaddress: $scope.manageripaddress,
                              alive: $scope.manageralive,
                              numCPU: $scope.managerNumCPU,
                              RAM: $scope.managerRAM
                              });

      $scope.name='';
      $scope.type='';
      $scope.managerhostname='';
      $scope.manageripaddress='';
      $scope.managerNumCPU='';
      $scope.managerRAM='';
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

    $scope.toggleAddClusterForm = function(){
      $scope.addform = !$scope.addform;
    };


    $scope.suspendSystem = function(cluster, system){
      if(system.suspended != null){
        $scope.isSuspended = !system.suspended;
      }
      else{
        $scope.isSuspended = false;
      }
      clusters.suspendSystem(cluster, system, $scope.isSuspended);
    };

    $scope.display = function(){
        $scope.alertDisplayed = true;
      $timeout(function() {
        $scope.alertDisplayed = false;
      }, 3000)
    };

    $scope.getHref = function(ip){
      return "http://"+ip+":8081"
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

    $scope.trustAsHtml = function(string) {
      return $sce.trustAsHtml(string);
    };

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

      modalInstance.result.then(function(updated){
        // if the modal was saved, display the success alert
        if(updated) $scope.display();
      });
    };

    $scope.displayDataStreamView = function(){
      $scope.clusterview = false;
    }

    $scope.displayClusterView = function(){
      $scope.clusterview = true;
    }

    $scope.openDeployingStream = function(){
      // toggle view: clusterview if true, deploy data stream view if false.
      $scope.displayDataStreamView();
    };


    $scope.openDeployer = function(size, _cluster){
      var modalInstance = $modal.open({
        templateUrl: 'deployerModal.html' ,
        controller: 'deployerModalCtrl',
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

      modalInstance.result.then(function(info){
        deployInfo = JSON.parse(info);
        deployConfig = "config = " + JSON.stringify(deployInfo.config, null, 2);
        clusters.execDeployer(deployInfo, deployConfig);
        $scope.openDeployingStream();
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

      modalInstance.result.then(function(updated){
         // if the modal was saved, display the success alert
        if(updated) $scope.display();
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

      modalInstance.result.then(function(updated){
         // if the modal was saved, display the success alert
        if(updated) $scope.display();
      });
    };
  }]);
