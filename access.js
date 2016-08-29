angular.module('startpath').controller('access', ['$timeout','$scope', '$http', '$localStorage','$window', function($timeout,$scope, $http, $localStorage, $window){

  $scope.register = function(firstname, username, password) {
    console.log(firstname + username + password);
		$http.post('/register', {name: firstname, username: username, password: password})
			.then(function(response){
				if (response.data.success){
					$scope.formData ={};
					$localStorage.token = response.data.token;
					$state.go('app');
				} else {
					alert(response.data.message);
				}
			})
			.catch(function(){
				console.log("There was an error");
				delete localStorage.token;
			})
	}

	$scope.login = function($location) {
		$http.post('/login', {username: $scope.username, password: $scope.password})
			.success(function(response){
				$scope.formData ={};
				if (response.success){
					$localStorage.token = response.token;
				  $state.go('app');
				} else {
					alert(response.message);
				}
			})
			.error(function(){
				console.log("There was an error");
				delete $localStorage.token;
			})
	}

}])
