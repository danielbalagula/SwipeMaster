angular.module('startpath').controller('app', ['$localStorage', '$window', '$scope', '$location', '$http', '$ionicModal', function($localStorage, $window, $scope, $location, $http, $ionicModal, TDCardDelegate){

	$scope.likes = [];
	$scope.hideLoadingProgress = true;
	$scope.startupShown;
	$scope.cardsReady = false;
	$scope.cardToDisplay;

	$scope.cards = {
    active: [],
    available: [],
  }

  $scope.showProfile = function(card){
    $scope.cardToDisplay = card;
    $ionicModal.fromTemplateUrl('profile.html', {
      scope: $scope
    }).then(function(modal) {
      $scope.modal = modal;
      $scope.modal.show();
    });
  }

  $scope.cardDestroyed = function(index) {
		if ($scope.cards.available.length < 1){
			$scope.refreshCards();
		}
    $scope.cards.active.splice(index, 1);
  };

  $scope.refreshCards = function() {
    $scope.cards.active = Array.prototype.slice.call($scope.cards.available, 0);
  }

  $scope.$on('removeCard', function(event, element, card) {

  });

  $scope.cardSwipedLeft = function(index) {
    console.log('LEFT SWIPE');
    var card = $scope.cards.active[index];
		$scope.sendSwipeToServer(card, false);

  };
  $scope.cardSwipedRight = function(index) {
    console.log('RIGHT SWIPE');
    var card = $scope.cards.active[index];
		$scope.sendSwipeToServer(card, true);
    $scope.likes.push(card);
    console.log($scope.likes);
  };

	$scope.getStartupsFromServer = function(){
		$scope.hideLoadingProgress = false;
		$http.get('/getstartups').then(function(response){
			$scope.hideLoadingProgress = true;
			if (response.data.length > 0){
				for (i=0;i<response.data.length;i++){
					$scope.cards.available.push(response.data[i]);
				}
				$scope.refreshCards();
        $scope.cardsReady = true;
			} else {

			}
		},function(error){
			console.log("There was an error");
		});
	}

  $scope.getLikesFromServer = function(){
		var likes = new Array(10);
		$http.get('/getlikes').then(function(response){
			$scope.likes = response.data;
		},function(error){
			console.log("There was an error");
		});
	}

	$scope.getStartupsFromServer();
  $scope.getLikesFromServer();

	$scope.setStartupShown = function(startup,list){
		if ($scope.cards.length == 0 && list == false){
			$scope.showStartup = null;
		} else {
			$scope.startupShown = startup;
			if (list){
				$scope.showStartup();
			}
		}
	}

	$scope.sendSwipeToServer = function(startup_card, swiped_right){
		$http.post('/swipe', {startup_id: startup_card._id, liked: swiped_right})
			.then(function(response){

			})
			.catch(function(){
				console.log("There was an error");
				logout();
			})
	}

	$scope.logout = function(){
		if ($localStorage.token) {
			delete $localStorage.token;
			$location.path('/');
		}
	}
}])

.controller('CardCtrl', function($scope, TDCardDelegate) {

});
