angular.module('startpath').config(['$stateProvider', '$httpProvider', '$sceDelegateProvider', '$urlRouterProvider', function($stateProvider, $httpProvider, $sceDelegateProvider, $urlRouterProvider) {

	$sceDelegateProvider.resourceUrlWhitelist([
    'self',
    'https://www.youtube.com/embed/**'
  ]);

	$httpProvider.interceptors.push('AuthenticationInterceptor');

	$stateProvider

	.state('checkAuth', {
		url: '/',
		controller: 'checkAuth'
	})
	.state('access', {
		url: '/access',
		templateUrl: 'access.html',
		controller: 'access'
	})
	.state('invalidated', {
		url: '/app',
		templateUrl: 'invalidated.html',
		controller: 'access'
	})
	.state('app', {
		url: '/app',
		templateUrl: 'mobile_app.html',
		controller: 'app'
	})
	.state('app.account', {
		url: '/account',
		views: {
			'account-tab': {
				templateUrl: 'account.html'
			}
		}
	})
	.state('app.swipe', {
		url: '/swipe',
		views: {
			'swipe-tab': {
				templateUrl: 'swipe.html'
			}
		},
	})
	.state('app.likes', {
		url: '/likes',
		views: {
			'likes-tab': {
				templateUrl: 'likes.html'
			}
		},
	})

  $urlRouterProvider.otherwise('checkAuth');

	}]);
