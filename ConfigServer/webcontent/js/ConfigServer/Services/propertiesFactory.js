var myApp = angular.module('myApp');
/* Service for property dictionary */
myApp.factory('properties', ['$http', 'auth', function($http, auth){
  var p = {
    properties: [],
  };

  p.getAll = function(){
    return $http.get('/properties').success(function(data){
      angular.copy(data, p.properties);
    });
  };

  p.addProperty = function(property){
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
