var myApp = angular.module('myApp')

myApp.factory('auth', ['$http', '$window', function($http, $window){
  var auth = {};

  // posts a user to /register route and saves the token returned
  auth.register = function(user){
    return $http.post('/register', user).success(function(data){
      auth.saveToken(data.token);
    });
  };

  // posts a user to /login route and saves the token returned
  auth.logIn = function(user){
      return $http.post('/login', user).success(function(data){
        auth.saveToken(data.token);
      });
  };

  // log out removes the users token from local storage
  auth.logOut = function(user){
    return $http.post('/logout', user).success(function(data){
      $window.localStorage.removeItem('cluster-manager-token');
    });
  };

  // save the token to local storage
  auth.saveToken = function (token){
    $window.localStorage['cluster-manager-token'] = token;
  };

  // get the token from local storage
  auth.getToken = function (){
    return $window.localStorage['cluster-manager-token'];
  };

  // check if user is logged in by checking token
  auth.isLoggedIn = function(){
    var token = auth.getToken();

    // if the token exists, log in
    if(token){
      var payload = JSON.parse($window.atob(token.split('.')[1]));

      return payload.exp > Date.now() / 1000;
    } else {

      return false; // otherwise assume user is logged out
    }
  };

  // returns the username of the user that's logged in
  auth.currentUser = function(){
    if(auth.isLoggedIn()){
      var token = auth.getToken();
      var payload = JSON.parse($window.atob(token.split('.')[1]));

      return payload.username;
    }
  };

  return auth;
}]);
