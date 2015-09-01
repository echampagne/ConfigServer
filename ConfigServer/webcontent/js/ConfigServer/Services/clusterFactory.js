var myApp = angular.module('myApp');
/* Service for cluster list */
myApp.factory('clusters', ['$http', 'auth', '$rootScope', function($http, auth, $rootScope){
  var o = {
   clusters: [],
   deploydata: [{}],
   isDeploying: false,
  };

  o.getAll = function(){
    return $http.get('/clusters',
      {headers: {Authorization: 'Bearer '+auth.getToken()}
      }).success(function(data){
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
      alive: system.alive,
      numCPU: system.numCPU,
      RAM: system.RAM},
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

  o.suspendSystem = function(cluster, system, suspend){
    return $http.post('/suspend/clusters/' + cluster.name + '/system/' + system.hostname,
      {'suspend': suspend}, {headers: {Authorization: 'Bearer '+auth.getToken()}
    }).success(function(data){
      var c_index = o.clusters.indexOf(cluster);
      var s_index = o.clusters[c_index].systems.indexOf(system);
      o.clusters[c_index].systems[s_index] = data.systems[s_index];
    });
  };

  o.execDeployer = function(deployInfo, deployConfig){
    o.deploydata = [{}];
    var evtSource = new EventSource("/execDeployer?info=" + encodeURIComponent(JSON.stringify(deployInfo))
      + '&config=' + encodeURIComponent(deployConfig));

    evtSource.onmessage = function(e) {
      var html_string = parseToHTML(e.data);

      o.deploydata.push({output: html_string});
      //For some reason, this is the only thing that makes angular update...
      $rootScope.$digest();

      if(html_string.indexOf("##FINISHED##") != -1) {
        console.log("ONMESSAGE closing connection");
        evtSource.close();
      }
    };

    evtSource.onerror = function(e) {
      console.log("ONERROR closing connection");
      o.deploydata.push({output: "<span style=\"color:#FF4D4D;font-weight: bold;\">ERROR: CONNECTION TO DEPLOYSERVER UNEXPECTEDLY TERMINATED</span>"});
      $rootScope.$digest();
      evtSource.close();
    };
  };



  function parseToHTML(inputString){
    var outputString = "",
        codeChar1 = "",
        codeChar2 = "",
        color = "",
        isBold = false;

    for(var i=0; i<inputString.length; i++){
      if(inputString.charAt(i) == '\t'){
        outputString+='    '; //add 4 spaces for tab
      }
      if(inputString.charAt(i) == '\033'){
        //means we have a code, we need to read the i+2 char
        //example code:\033[92m or \033[0m
        //All codes except ENDC and BOLD are 3 digits starting with 9
        codeChar1 = inputString.charAt(i+2);
        codeChar2 = inputString.charAt(i+3);
        if(codeChar1 == '9' && codeChar2 != 'm'){
          if(codeChar2 == '2'){ //OKGREEN
            color = "#8DF432";
          } else if(codeChar2 == '5'){ //HEADER PURPLE
            color = "#BB8AFF";
          } else if (codeChar2 == '4'){ //OKBLUE
            color = "#624EFE";
          }else if (codeChar2 == '3'){ //WARNING
            color = "yellow";
          }else if (codeChar2 == '1'){ //FAIL
            color = "red";
          }
        } else{
          //means this is either an ENDC code or its a bold code
          if(codeChar1 == '1'){
            isBold = true;
          } else {
            //meaning codeChar1 is 0 --> ENDC
            outputString+="</span>";
          }
          i+=3;
          continue;
        }

        if(isBold){
          outputString+=("<span style=\"color:"+color+";font-weight: bold;\">");
        } else {
          outputString+=("<span style=\"color:"+color+";\">");
        }
        isBold = false;
        color = "";
        i+=4;
        continue;
      } else {
        outputString += inputString.charAt(i);
      }
    }

    return outputString;
  }


  o.getDeployData = function(){
    return o.deploydata;
  };

  o.getIsDeploying = function(){
    return o.isDeploying;
  };

  o.setDeploying = function(isDeploying){
    return $http.post('/setDeploy',
      isDeploying).success(function (data){
        o.isDeploying = data.isDeploying;
      });
  };

  o.getDeploying = function(){
    return $http.get('/getDeploy').success(function (data){
      o.isDeploying = data.isDeploying;
    });
  };



  return o;
}]);
