var myApp = angular.module('myApp');
/* Service for cluster list */
myApp.factory('clusters', ['$http', 'auth', function($http, auth){
  var o = {
   clusters: [],
  };

  o.getAll = function(){
    return $http.get('/clusters').success(function(data){
      angular.copy(data, o.clusters);
    });
  };

  o.get = function(id){
    return $http.get('/clusters/' + id).then(function(res){
      return res.data;
    });
  };

  o.createCluster = function(cluster) {
    return $http.post('/clusters', cluster,
      {headers: {Authorization: 'Bearer '+auth.getToken()}
    }).success(function(data){
      var found=false;
      for (index=0;index<o.clusters.length;++index){
        if(o.clusters[index].name === data.name){
          o.clusters[index].type = data.type;
          o.clusters[index].manager.hostname = data.manager.hostname;
          o.clusters[index].manager.ipaddress = data.manager.ipaddress;
          found=true;
        }
      };
      if(!found) return o.clusters.push(data);
    });
  };

  o.editCluster = function(old_cluster, cluster){
    return $http.put('/clusters/'+ old_cluster._id, cluster,
      {headers: {Authorization: 'Bearer '+auth.getToken()}
    }).success(function(data){
        var index = o.clusters.indexOf(old_cluster);
        o.clusters[index] = data;
        o.clusters[index].systems = old_cluster.systems;
    });
  };

  o.deleteCluster = function(c_name){
     return $http.delete('/clusters/' + c_name,
      {headers: {Authorization: 'Bearer '+auth.getToken()}
    }).success(function(res){
      return res.data;
    });
  };

  o.createSystem = function(cluster, system){
    return $http.post('/clusters/' + cluster.name + '/system',
      {hostname: system.hostname,
      ipaddress: system.ipaddress,
      alive: system.alive},
      {headers: {Authorization: 'Bearer '+auth.getToken()}
   }).success(function(data){
      var c_index = o.clusters.indexOf(cluster);
      o.clusters[c_index].systems.push(system);
    });
  };

  o.editSystem = function(cluster, old_system, system){

    return $http.post('/clusters/' + cluster.name + '/system/' + old_system.hostname,
      system, {headers: {Authorization: 'Bearer '+auth.getToken()}
    }).success(function(data){
      var c_index = o.clusters.indexOf(cluster);
      var s_index = o.clusters[c_index].systems.indexOf(old_system);
      o.clusters[c_index].systems[s_index] = system;
    });
  };

  o.deleteSystem = function(c_name, systemId){
    return $http.delete('/clusters/' + c_name + '/system/' + systemId,
      {headers: {Authorization: 'Bearer '+auth.getToken()}
        }).success(function(res){
          return res.data;
        });
  };

  return o;
}]);
