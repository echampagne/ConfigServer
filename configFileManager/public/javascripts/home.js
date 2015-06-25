  var myApp = angular.module('myApp', ['ui.router']);

      myApp.config(['$stateProvider', '$urlRouterProvider',
        function($stateProvider, $urlRouterProvider){
          $stateProvider
            .state('home', {
              url: '/home',
              templateUrl: '/home.html',
              controller: 'MainCtrl'
              resolve: {
                dictPromise: ['dict', function(dict){
                  return dict.getAll();
                }]
              }
            });
          $urlRouterProvider.otherwise('home');
        }]);

      myApp.factory('dict', ['$http', function($http){
      var o = {
        dict: []
      };

      o.getAll = function(){
        return $http.get('/dict').success(function(data){
          angular.copy(data, o.dict);
        });
      };

      return o;
    }]);


    myApp.controller('MainCtrl', ['$scope', 'dict',
      function($scope, dict){
        $scope.dict = dict.dict;

      $scope.addEntry = function(){
        if(!$scope.dict.key || !$scope.dict.value ){ return; }
        dict.create({
          key: $scope.dict.key,
          value: $scope.dict.value
        });
            $scope.dict.key='';
            $scope.dict.value='';
      };
    }]);
