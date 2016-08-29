angular.module('startpath').controller('access', ['$scope', '$http', '$localStorage','$state', '$ionicPopup', function($scope, $http, $localStorage, $state, $ionicPopup){

  $scope.accessValidation = function(username, password){
    if (username && password){
      if (username.length < 50 && password.length > 7 && password.length < 50){
        var mailPattern = /^[a-zA-Z0-9._-]+@mastercard.com$/;
        return !mailPattern.test(username);
      } else {
        return true;
      }
    } else {
      return true;
    }
  }

  $scope.register = function(username, password) {
  	delete $localStorage.token;
		$http.post('/register', {username: username, password: password})
			.then(function(response){
				if (response.data.success){
					$scope.formData ={};
					$localStorage.token = response.data.token;
					var alertPopup = $ionicPopup.alert({
						title: 'Success',
						template: 'An e-mail has been sent to ' + username + ' for verification!'
					});
				} else {
					alert(response.data.message);
				}
			})
			.catch(function(){
				console.log("There was an error");
				delete localStorage.token;
			})
	}

	$scope.login = function(username, password) {
		$http.post('/login', {username: username, password: password})
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
}]);
