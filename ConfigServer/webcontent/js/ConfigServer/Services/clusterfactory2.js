var myApp = angular.module('myApp');
/* Service for cluster list */
myApp.factory('clusters', ['$http', 'auth', function($http, auth){

   return {
    clusters: [],
    deploydata: {},
    isDeploying: false,
    serviceScope: this,

  getAll: function(){
    return $http.get('/clusters',
      {headers: {Authorization: 'Bearer '+auth.getToken()}
      }).success(function(data){
      angular.copy(data, this.clusters);
    });
  },

  get: function(id){
    return $http.get('/clusters/' + id).then(function(res){
      return res.data;
    });
  },

  createCluster: function(cluster) {
    console.log(this.clusters);
    return $http.post('/clusters', cluster,
      {headers: {Authorization: 'Bearer '+auth.getToken()}
    }).success(function(data){
      serviceScope.dummyfunction();
      console.log(this.clusters);
      var found=false;
      for (index=0;index<this.clusters.length;++index){
        if(this.clusters[index].name === data.name){
          this.clusters[index].type = data.type;
          this.clusters[index].manager.hostname = data.manager.hostname;
          this.clusters[index].manager.ipaddress = data.manager.ipaddress;
          found=true;
        }
      };
      if(!found) return this.clusters.push(data);
    });
  },

  dummyfunction: function(){
    console.log('hello world');
  },

  editCluster: function(old_cluster, cluster){
    return $http.put('/clusters/'+ old_cluster._id, cluster,
      {headers: {Authorization: 'Bearer '+auth.getToken()}
    }).success(function(data){
        var index = this.clusters.indexOf(old_cluster);
        this.clusters[index] = data;
        this.clusters[index].systems = old_cluster.systems;
    });
  },

  deleteCluster: function(c_name){
     return $http.delete('/clusters/' + c_name,
      {headers: {Authorization: 'Bearer '+auth.getToken()}
    }).success(function(res){
      return res.data;
    });
  },

  createSystem: function(cluster, system){
    return $http.post('/clusters/' + cluster.name + '/system',
      {hostname: system.hostname,
      ipaddress: system.ipaddress,
      alive: system.alive},
      {headers: {Authorization: 'Bearer '+auth.getToken()}
   }).success(function(data){
      var c_index = this.clusters.indexOf(cluster);
      this.clusters[c_index].systems.push(system);
    });
  },

  editSystem: function(cluster, old_system, system){
    return $http.post('/clusters/' + cluster.name + '/system/' + old_system.hostname,
      system, {headers: {Authorization: 'Bearer '+auth.getToken()}
    }).success(function(data){
      var c_index = this.clusters.indexOf(cluster);
      var s_index = this.clusters[c_index].systems.indexOf(old_system);
      this.clusters[c_index].systems[s_index] = system;
    });
  },

  deleteSystem: function(c_name, systemId){
    return $http.delete('/clusters/' + c_name + '/system/' + systemId,
      {headers: {Authorization: 'Bearer '+auth.getToken()}
        }).success(function(res){
          return res.data;
        });
  },

  execDeployer: function(deployInfo, deployConfig){
    console.log('starting execDeployer');
    return $http.post('/execDeployer', {'info':deployInfo, 'config':deployConfig},
      {headers: {Authorization: 'Bearer '+auth.getToken()}
    }).success( function(res){
        this.isDeploying = true;
        console.log('finished execDeployer');
        return res.data;
    });
  },

  connect: function(){
    this.deploydata = {output: ''};

    console.log('connecting?');
    var socket = io.connect('http://192.168.1.8:8083');
    console.log(socket);

    socket.on('news', function (data) {
      this.deploydata.output = this.deploydata.output.concat(data.msg + '\n');
      console.log('clusterfactory concat msg' + this.deploydata.output);
    });

    socket.on('please-disconnect', function(){
      console.log('received disconnect request from server');
      if(socket != null){
        socket.disconnect();
        console.log('disconnected');
        this.isDeploying = false;
      }
    });
  },

  };
}]);
