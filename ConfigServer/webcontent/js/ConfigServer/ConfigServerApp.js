var myApp = angular.module('myApp', ['ui.router', 'ui.bootstrap', 'luegg.directives', 'angularFileUpload', 'monospaced.elastic']);

myApp.config(['$stateProvider', '$urlRouterProvider',
  function($stateProvider, $urlRouterProvider){
    $stateProvider
      .state('home', {
        url: '/home',
        templateUrl: '/home.html',
        controller: 'MainCtrl',
        resolve:{
          clusterPromise: ['clusters', function(clusters){
            return clusters.getAll();
          }]
        }
      })
      .state('home_properties', {
        url: '/home/properties',
        templateUrl: '/home_properties.html',
        controller: 'PropertyCtrl',
        resolve:{
          propertyPromise: ['properties', function(properties){
            return properties.getAll();
          }]
        }
      })
      .state('login', {
        url: '/login',
        templateUrl: '/login.html',
        controller: 'AuthCtrl',
        onEnter: ['$state', 'auth', function($state, auth){
          if(auth.isLoggedIn()){
            $state.go('home');
          }
        }]
      })
      .state('register', {
        url: '/register',
        templateUrl: '/register.html',
        controller: 'AuthCtrl',
        onEnter: ['$state', 'auth', function($state, auth){
          if(auth.isLoggedIn()){
            $state.go('home');
          }
        }]
      })
      .state('user_controls', {
        url: '/home/usercontrols',
        templateUrl: 'user_controls.html',
        controller: 'UserController'
      });

    $urlRouterProvider.otherwise('home');
  }]);
