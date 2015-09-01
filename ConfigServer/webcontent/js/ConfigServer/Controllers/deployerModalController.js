var myApp = angular.module('myApp');
// controler
myApp.controller('deployerModalCtrl', ['$scope', '$modalInstance', 'cluster', 'clusters', 'FileUploader',
  function($scope, $modalInstance, cluster, clusters, FileUploader){
  $scope.deployfromOptions = ['manager3(dev)', 'system4(dev)', 'zipfiles'];
  $scope.cluster = cluster;
  $scope.checkboxModel = {
    manager : false,
    pipeline : false
  };

  clusters.getDeploying();
  $scope.disableDeploy = clusters.getIsDeploying;

  $scope.deploy = function(){
    var deployinfo = {};
    deployinfo.config = {};
    deployinfo.config.manager=[{}];
    deployinfo.config.systems=[];

    deployinfo.deployFrom = $scope.system_to_deploy;
    deployinfo.deployManager = $scope.checkboxModel.manager;
    deployinfo.deployPipeline = $scope.checkboxModel.pipeline;
    deployinfo.additionalArgs = $scope.additionalArgs;
    // express deploy, populate deployinfo object with dict entered.
    if($scope.expressdeploytext){
        deployinfo.config = JSON.parse($scope.expressdeploytext);
        $modalInstance.close(JSON.stringify(deployinfo, null, 2));
    }
    // populate deployinfo object with data entered from non-express deploy
    else if($scope.system_to_deploy &&
            ($scope.checkboxModel.manager
              || $scope.checkboxModel.pipeline)
            ){
      deployinfo.config.manager[0]['hostname'] = cluster.manager.hostname;
      deployinfo.config.manager[0]['ip address'] = cluster.manager.ipaddress;
      deployinfo.config.manager[0]['root password'] = $scope.cluster.manager.rootpassword;
      deployinfo.config.manager[0]['pplnuser password'] = $scope.cluster.manager.pplnuserpassword;
      $scope.cluster.manager.rootpassword = "";
      $scope.cluster.manager.pplnuserpassword = "";

      $scope.cluster.systems.forEach ( function(system, i){
        if(system.rootpassword && system.pplnuserpassword){
          deployinfo.config.systems.push({
            'hostname': system.hostname,
            'ip address': system.ipaddress,
            'root password': system.rootpassword,
            'pplnuser password': system.pplnuserpassword
          });
          system.rootpassword = "";
          system.pplnuserpassword = "";
        }
        else{
          console.log('missing password at ' + system.hostname);
        }
      });
      $modalInstance.close(JSON.stringify(deployinfo, null, 2));
    }
    else{
      $modalInstance.dismiss('cancel');
    }
  };


  //File Uploader related
  var uploader = $scope.uploader = new FileUploader({
    url: '/upload'
  });

  uploader.filters.push({
    name: 'customFilter',
    fn: function(item /*{File|FileLikeObject}*/, options) {
      return this.queue.length < 10;
    }
  });
}]);
