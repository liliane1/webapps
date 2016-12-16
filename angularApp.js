var app = angular.module('flapperNews', ['ui.router']);

app.controller('MainCtrl', [
	'$scope',
	'posts',
	'auth',
	function($scope, posts, auth){
		$scope.isLoggedIn = auth.isLoggedIn;
		$scope.posts = posts.posts;
		$scope.addPost = function(){

			if(!$scope.title || $scope.title ===""){
					alert("empty title");
					return;
			}

			posts.create({
				title: $scope.title,
				link : $scope.link
			});

			$scope.title= '';
			$scope.link = '';
			};

		$scope.incrementUpvotes = function(post){

			posts.upvote(post);

		}
	}]);
app.factory('posts', ['$http','auth', function($http, auth){
	var postFactory = {
		posts: []
	};

	postFactory.getAll = function(){
		return $http.get('/posts').success(function(data){

			angular.copy(data, postFactory.posts);
		});
	};
	//aanmaken van nieuwe posts
	postFactory.create = function(post) {
		//alert("call post method");
		var token = {headers:{
			Authorization:'Bearer ' + auth.getToken()}
		};
		//alert("token"+'Bearer ' + auth.getToken());

		return $http.post('/posts', post, token).success(function(data){
		//	alert("sucess post method");
			postFactory.posts.push(data);
		}).error(function(err){
			//alert("error post method" + err);
		});
	};

	//upvoting post
	postFactory.upvote = function(post){
		//put method: to upvote post; call returns successfully, update local copy to reflect
		//the changes.
		return $http.put('/posts/'+ post._id + '/upvote', null, {headers:{
			Authorization: 'Bearer ' + auth.getToken()}
		}).success(function(data){
				post.upvotes += 1;
			});
	};

	//get post by id
	postFactory.get = function(id){
		return $http.get('/posts/' + id).then(function(res){
			return res.data;
		});
	};

	//toevoegen van comment
	postFactory.addComment = function(id, comment){
		return $http.post('/posts/' + id + '/comments', comment,{headers: {
			Authorization: 'Bearer ' + auth.getToken()}});
	};

	//enable upvoting of comments
	postFactory.upvoteComment = function(post, comment){
	    return $http.put('/posts/' + post._id + '/comments/' + comment._id + '/upvote', null,
	          {headers: {Authorization: 'Bearer ' + auth.getToken()}}).success(function(data){
			comment.upvotes += 1;
		});
	};

	return postFactory;
}]);

app.config([
	'$stateProvider',
	'$urlRouterProvider',
		function($stateProvider, $urlRouterProvider){
			//home.html te tonen
		$stateProvider
			.state('home', {
				url:'/home',
				templateUrl: '/home.html',
				controller:'MainCtrl',
				resolve:{
				   postPromise: ['posts', function(posts){
					return posts.getAll();
				    }]
				}
			})
			//posts.htlm te tonen
			.state('postsComments', {
				url: '/postsComments/:id',
				templateUrl: '/posts.html',
				controller : 'PostsCtrl',
				resolve: {
				  post: ['$stateParams', 'posts', function($stateParams, posts){
						var rep = posts.get($stateParams.id);
						return rep;
					}]
				}
			})
			//login scherm te tonen
			.state('login', {
				url:'/login',
				templateUrl:'/login.html',
				controller: 'AuthCtrl',
				onEnter: ['$state', 'auth', function($state, auth){
					if(auth.isLoggedIn()){
						$state.go('home');
					}
				}]
			})
			//registratiescherm te tonen
			.state('register', {
				url:'/register',
				templateUrl:'/register.html',
				controller:'AuthCtrl',
				onEnter: ['$state', 'auth', function($state, auth){
					if(auth.isLoggedIn()){
						$state.go('home');
					}
				}]
			});

		$urlRouterProvider.otherwise('home');
	}

]);
//stateParams wordt verwijderd en vervangen door post
//stateParams wordt gebruikt om Id van een URL op te halen en laadde de desbetreffende post op
app.controller('PostsCtrl', [
		'$scope',
		'posts',
		'post',
	'auth',
		function($scope, posts, post, auth){
			$scope.isLoggedIn = auth.isLoggedIn;
			$scope.post = post;
		$scope.addComment = function(){
			if($scope.body === '')
			{return;}

			posts.addComment(post._id, {
			    body: $scope.body,
			    author: 'user',}).success(function(comment){
			     $scope.post.comments.push(comment);
			   });

			$scope.body = '';
			};

		$scope.incrementUpvotes = function(comment){
			posts.upvoteComment(post, comment);
		    };
	}]
);

//aanmaken van authenticatie factory
app.factory('auth', ['$http', '$window', function($http, $window){
	var auth ={};
	//aanmaken van saveToken
	auth.saveToken = function(token){
			$window.localStorage['flapper-news-token'] = token;
		};
	//aanmaken van getToken
	auth.getToken = function(){
		return $window.localStorage['flapper-news-token'];
	}
	//geeft een boolean terug als de gebruiker ingelogd is
	auth.isLoggedIn = function(){
		var token = auth.getToken();

		//controleren of token bestaat
		if(token){
			var payload = JSON.parse($window.atob(token.split('.')[1]));
			return payload.exp > Date.now() / 1000;
		} else {
			return false;
		}
	};
	auth.currentUser = function(){
		if(auth.isLoggedIn()){
			var token = auth.getToken();
			var payload = JSON.parse($window.atob(token.split('.')[1]));

			return payload.username;
		}
	};

	auth.register = function(user){
	return $http.post('/register', user).success(function(data){
		auth.saveToken(data.token);
	});
};
	auth.logIn = function(user){
		return $http.post('/login', user).success(function(data){
			auth.saveToken(data.token);
		});
	};
	auth.logOut = function(){
		$window.localStorage.removeItem('flapper-news-token');
	};

	return auth;
}]
);

//authentication controller
//controller voor login en register
app.controller('AuthCtrl', [
	'$scope',
	'$state',
	'auth',
	function($scope, $state, auth){
		//initialize user op scope voor ons form
		$scope.user = {};
		$scope.register = function(){
			auth.register($scope.user).error(function(error){
				$scope.error = error;
			}).then(function(){
				$state.go('home');
			});
		};

		$scope.logIn = function(){
			auth.logIn($scope.user).error(function(error){
				$scope.error = error;
			}).then(function(){
				$state.go('home');
			});
		};
	}]
);
//controller voor navigatie
app.controller('NavCtrl', [
	'$scope',
	'auth',
	function($scope, auth){
		$scope.isLoggedIn = auth.isLoggedIn;
		$scope.currentUser = auth.currentUser;
		$scope.logOut = auth.logOut;
	}]
);
