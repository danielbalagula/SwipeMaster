angular.module('startpath').controller('app', ['$localStorage', '$scope', '$http', '$ionicModal', '$state', '$ionicPopup', function($localStorage, $scope, $http, $ionicModal, $state, $ionicPopup){

	if ($localStorage.token == null){
		$state.go('access');
	}

	$scope.likes = [];
	$scope.hideLoadingProgress = true;
	$scope.startupShown;
	$scope.cardsReady = false;
	$scope.cardToDisplay;
	$scope.tags;

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

	$scope.getTagsFromServer = function(){
		$http.get('/getTags')
			.then(function(response){
				$scope.tags = response;
			})
			.catch(function(){
				console.log("There was an error");
				logout();
			})
	};

	$scope.getTagsForStartup = function(startup_card){
		for (i=0; i<$scope.tags.length; i++){
			if (startup_card.id == $scope.tags[i].startup_id){
				console.log($scope.tags[i].tags);
			}
		}
	};

	$scope.addTagsLocally = function(startup_card, tag){
		for (i=0; i<$scope.tags.length; i++){
			if (startup_card.id == $scope.tags[i].startup_id){
				$scope.tags[i].tags.push(tag);
			}
		}
	};

	$scope.addTags = function(startup_card, newTag){
		$http.post('/addTags', {startup_id: startup_card._id, tag: newTag})
			.then(function(response){
				$scope.addTagsLocally(startup_card, newTag);
			})
			.catch(function(){
				console.log("There was an error");
				logout();
			})
	};

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
	var card = $scope.cards.active[index];
		$scope.sendSwipeToServer(card, false);

	};
	$scope.cardSwipedRight = function(index) {
	var card = $scope.cards.active[index];
		$scope.sendSwipeToServer(card, true);
	$scope.likes.unshift(card);
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
		$http.get('/getlikes').then(function(response){
			$scope.likes = response.data;
		},function(error){
			console.log("There was an error");
		});
	}

	$scope.getStartupsFromServer();
	$scope.getLikesFromServer();
	$scope.getTagsFromServer();

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
			$state.go('access');
		}
	}

	$scope.showTagPopup = function(cardToDisplay) {
	  $scope.data = {};
	  var myPopup = $ionicPopup.show({
	    template: '<input type="text" ng-model="data.tag">',
	    title: 'Enter Tag',
	    subTitle: 'Tags categorize startups and make them easier to group',
	    scope: $scope,
	    buttons: [
	      { text: 'Cancel' },
	      {
	        text: '<b>Save</b>',
	        type: 'button-positive',
	        onTap: function(e) {
	          if (!$scope.data.tag) {
	            e.preventDefault();
	          } else {
	            return $scope.data.tag;
	          }
	        }
	      }
	    ]
	  });
		myPopup.then(function(res) {
			if (res){
				$scope.addTags(cardToDisplay, res);
			}
		})
	}

	$scope.accessValidation = function(username){
		if (username){
			if (username.length < 50){
				var mailPattern = /^[a-zA-Z0-9._-]+@mastercard.com$/;
				return !mailPattern.test(username);
			} else {
				return true;
			}
		} else {
			return true;
		}
	}

	$scope.getShowReferralState = function(show_referral){
		if (show_referral){
			return true;
		} else {
			return false;
		}
	}

	$scope.refer = function(referral_recipient, show_referral){
		$http.post('/sendreferral', {sender: $scope.username, recipient: referral_recipient, show_sender: show_referral})
			.then(function(response){

			})
			.catch(function(){
				console.log("There was an error");
				logout();
			})
	}

}])

.controller('CardCtrl', function($scope, TDCardDelegate) {

});
