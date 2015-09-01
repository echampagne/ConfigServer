var myApp = angular.module('myApp');
/* Service for property dictionary */

// List of keys that have object values
var objectKeyList = ['TIMELIMIT_DICT', 'ALLOWABLE_MAX_JOBS_PER_MACHINE_FOR',
                'DEV_EXCEPTION_EMAIL_LIST', 'QA_EXCEPTION_EMAIL_LIST',
                'PROD_EXCEPTION_EMAIL_LIST'];

myApp.factory('properties', ['$http', 'auth', function($http, auth){
  var p = {
    properties: [],
  };

  p.getAll = function(){
    return $http.get('/properties',
      {headers: {Authorization: 'Bearer '+auth.getToken()}
      }).success(function(data){
        angular.copy(data, p.properties);
    });
  };

  p.addProperty = function(property){
    if(!isNaN(property.value)){
      property.value = parseInt(property.value);
    }
    // check if key has a object value
    if(objectKeyList.indexOf(property.key) > -1){
      property.value = JSON.parse(property.value);
    }
    return $http.post('/add/properties', property,
      {headers: {Authorization: 'Bearer '+auth.getToken()}
    }).success(function(data){
      var found=false;
      for (index=0;index<p.properties.length;++index){
        if(p.properties[index].key === data.key){
          p.properties[index].value = data.value;
          found=true;
        }
      };
      if(!found) return p.properties.push(data);
    });
  };

  p.editProperty = function(old_property, property){
    if(!isNaN(property.value)){
      property.value = parseInt(property.value);
    }
    // check if key has a object value
    if(objectKeyList.indexOf(property.key) > -1){
      property.value = JSON.parse(property.value);
    }
    return $http.put('/edit/properties/' + old_property._id, property,
      {headers: {Authorization: 'Bearer '+auth.getToken()}
    }).success(function(data){
        var index = p.properties.indexOf(old_property);
        p.properties[index] = data;
    });
  };

  p.deleteProperty = function(p_id){
    return $http.delete('/properties/id/' + p_id,
      {headers: {Authorization: 'Bearer '+auth.getToken()}
    }).success(function(res){
      return res.data;
    });
  };

  return p;
}]);
