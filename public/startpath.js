angular.module('startpath', ['ionic', 'ionic.contrib.ui.tinderCards2', 'ngStorage', 'ui.router'])

.directive('noScroll', function($document) {
  return {
    restrict: 'A',
    link: function($scope, $element, $attr) {
      $document.on('touchmove', function(e) {
        e.preventDefault();
      });
    }
  }
})

.factory('AuthenticationInterceptor', ['$q', '$location', '$localStorage', function ($q, $location, $localStorage) {
	return {
		'request': function (config) {
			config.headers = config.headers || {};
			if ($localStorage.token) {
				token = $localStorage.token;
				config.headers.Authorization = "Bearer " + $localStorage.token;
			}
			return config;
		},
			'responseError': function (response) {
			if (response.status === 401 || response.status === 403) {
				$location.path('/login');
			}
			return $q.reject(response);
		}
	}
}])
