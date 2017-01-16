var serverAddress = "http://localhost"

var app = angular.module('examenPrepApp',['ngRoute']);

app.controller('mainController',function($scope, $location){
  $scope.goToLogin = function(){
    $location.path('/login')
  };
  $scope.gotoRegister = function () {
    $location.path('/register')
  }
});
app.controller('loginController',function($scope, $location, $http){
  $scope.user = {
    username: "",
    password: ""
  };
  $scope.login = function () {
    $http.post(serverAddress+"/api/checkUser", $scope.user).success(function (res) {
      if (res == null) {
        $location.path('/');
      } else {
        $location.path('/home/'+$scope.user.username);
      }
    });
  }
});

app.controller('registerController',function ($scope, $location, $http) {
  $scope.user = {
    username: "",
    password: ""
  };
  $scope.createUser = function () {
    $http.post(serverAddress+"/api/createUser", $scope.user).success(function (res) {
      console.log(res);
      if (!res) {
        $location.path('/home/'+$scope.user.username);
        console.log("new user")
      } else {
        $scope.info = "deze gebruiker bestaat al";
      }
    });
  }


})

app.controller('homeController',function($scope, $location, $routeParams, $interval ,$http){
  $scope.id = $routeParams.id;
  $scope.posts = [];
  $scope.bericht = "";
  getData();
  $interval(getData, 1000);

  function getData() {
    $http.get(serverAddress+"/api/getPosts").success(function (res) {
      $scope.posts = res;
    });
  }

  $scope.sendPost = function () {
    $scope.post = {"username":$scope.id , "message":$scope.bericht};
    $http.post(serverAddress+"/api/sendPost",$scope.post).success(function (res) {
      getData();
    })
  }

  $scope.deletePost = function (post) {
    $http.post(serverAddress+'/api/deletePost', post).success(function(res) {
      getData();
    });
  }

});

app.config(function($routeProvider){
  $routeProvider
    .when('/',{
      templateUrl: 'main.html',
      controller: 'mainController'
    })

    .when('/login',{
      templateUrl: 'login.html',
      controller: 'loginController'
    })

    .when('/home/:id',{
      templateUrl: 'home.html',
      controller: 'homeController'
    })

    .when('/register',{
      templateUrl: 'register.html',
      controller: 'registerController'
    })

    .otherwise({
      redirectTo:'/'
    })
});
