angular.module('startpath').controller('checkAuth', ['$scope', '$http', '$location','$state', function($scope, $http, $location, $state){

  $http.get('/loggedin').then(function(response){
    console.log(response);
    if (response.data.isValidated == 'false') {
      $state.go('access');
    } else if (response.data.authenticated == 'false'){
      if ($location.url() != "/"){
        $state.go('access');
      }
    } else {
      $scope.username = response.data.username;
      $state.go('app');
    }
  }).catch(function(error){
  });
}]);
