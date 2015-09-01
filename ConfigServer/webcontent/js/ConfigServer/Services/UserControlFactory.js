var myApp = angular.module('myApp');
myApp.factory('user_control', ['$http', 'auth', function($http, auth){
  var u = {
    user: {}
  };

  u.getUser = function(username){
    return $http.post('/user', {'username': username},
      {headers: {Authorization: 'Bearer '+ auth.getToken()}
    }).success(function(res){
      console.log(res);
      if(res) angular.copy(res, u.user);
      if(!res) return null;
    });
  };

  u.addControl = function(username, control){
    return $http.post('/user/controls', {'username': username, 'control': control},
      {headers: {Authorization: 'Bearer '+ auth.getToken()}
    }).success(function(res){
      angular.copy(res, u.user);
    });
  };

  u.removeControl = function(username, control){
    return $http.post('/delete/user/controls', {'username': username, 'control': control},
      {headers: {Authorization: 'Bearer '+ auth.getToken()}
    }).success(function(res){
      angular.copy(res, u.user);
    });
  };


  return u;
}]);
