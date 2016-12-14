/*door de combinatie van ui-router in var app en
app.config([
	'$stateProvider',
	'$urlRouterProvider',
	//configureren van een home state door gebruik te maken van
	//$stateProvider en $urlRouterProvider
		function($stateProvider, $urlRouterProvider){
		$stateProvider
			.state('home, {
				url:'/home',
				templateUrl: '/home.html',
				controller:'MainCtrl'
			});
			//redirect niet gespecifieerde routen
		urlRouterProvider.ohterwise('home');
}]);
worden de verschillende posts en tekstvakken niet getoond*/

var app = angular.module('flapperNews', ['ui.router']);

app.controller('MainCtrl', [
	'$scope',
	'posts',
	'auth',
	function($scope, posts, auth){
		//$scope.test = 'Hello World';
		$scope.isLoggedIn = auth.isLoggedIn;
		$scope.posts = posts.posts;
		/*$scope.posts =[
			{title: 'post 1', upvotes : 5},
			{title: 'post 2', upvotes : 2},
			{title: 'post 3', upvotes : 15},
			{title: 'post 4', upvotes: 9},
			{title: 'post 5', upvotes: 4}
		];*/
		$scope.addPost = function(){

			alert("hi ");
			//voorkomen dat er lege titels worden toegevoegd aan de lijst
			if(!$scope.title || $scope.title ===""){
					alert("empty title");
					return;
			}
			//$scope.posts.push({title: 'A new post!', upvotes: 0});
			//$scope.posts.push({
			// $scope.
			posts.create({
				title: $scope.title,
				link : $scope.link
			});
				//upvotes: 0});
				//comments: [
				//{author: 'Joe', body: 'Cool post!', upvotes:0},
				//{author: 'Bob', body: 'Great idea but everything is wrong!', upvotes:0}
				//]
			//leegmaken tekstvak nadat er op de submit knop geklikt is
			$scope.title= '';
			$scope.link = '';
			};
			//waarde van een titel verhogen met 1
		$scope.incrementUpvotes = function(post){
			//post.upvotes +=1;
			post.upvote(post);
		}
	}]);
//$http is een angular functie: service voor de query voor onze route posts
app.factory('posts', ['$http','auth', function($http, auth){
	//service body
	var postFactory = {
		posts: []
	};
	//angular copy method: create a deep copy of the returned data
	//ophalen van de posts
	postFactory.getAll = function(){
		//success() method: laat ons toe to bind functions die
		//die worden uitgevoerd wanneer de request terugkeert.
		return $http.get('/posts').success(function(data){
		//een lijst van posts wordt getoond, deze lijst wordt
		//gekopieerd naar de client side posts postFactory.
			angular.copy(data, postFactory.posts);
		});
	};
	//aanmaken van nieuwe posts
	postFactory.create = function(post) {
		alert("call post method");
		var token = {headers:{
			Authorization:'Bearer ' + auth.getToken()}
		};
		alert("token"+'Bearer ' + auth.getToken());

		return $http.post('/posts', post, token).success(function(data){
			alert("sucess post method");
			postFactory.posts.push(data);
		}).error(function(err){alert("error post method" + err);});
	};

	//upvoting post
	postFactory.upvote = function(post){
		//put method: to upvote post; call returns successfully, update local copy to reflect
		//the changes.
		return $http.put('/posts/'+ post._id + 'upvote', null, {headers:{
			Authorization: 'Bearer' + auth.getToken()}
		}).success(function(data){
				post.upvotes +=1;
			});
	};

	//get post by id
	postFactory.get = function(id){
		return ($http.get('/posts/' + id).then(function(res){
			return res.data;
		}));
	};

	//toevoegen van comment
	postFactory.addComment = function(id, comment){
		return $http.post('/posts/' + id + '/comments', comment,{headers: {
			Authorization: 'Bearer' + auth.getToken()}});
	};
	//enable upvoting of comments
	postFactory.upvoteComment = function(post, comment){
	    return $http.put('/posts/' + post._id + '/comments/' + comment._id + '/upvote', null,
	          {headers: {Authorization: 'Bearer' +auth.getToken()}}).success(function(data){
			comment.upvotes +=1;
		});
	};

	return postFactory;
}]);

app.config([
	'$stateProvider',
	'$urlRouterProvider',
	//configureren van een home state door gebruik te maken van
	//$stateProvider en $urlRouterProvider
		function($stateProvider, $urlRouterProvider){
//home page te tonen
		$stateProvider
			.state('home', {
				url:'/home',
				templateUrl: '/home.html',
				controller:'MainCtrl',
				//resolve property: anytime 'home' state is entered,
				//automatically query all posts from our backend before state actually finisched loading
				resolve:{
				   postPromise: ['posts', function(posts){
					return posts.getAll();
				    }]
				}
			})
			//posts.htlm te tonen
			.state('posts', {
				url: '/posts/{id}',
				templateUrl: '/posts.htlm',
				controller : 'PostsCtrl',
				resolve: {
				  post: ['$stateParams', 'posts', function($stateParams, posts){
					return posts.get($stateParams.id);
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
			//redirect niet gespecifieerde routen
		$urlRouterProvider.otherwise('home');
	}]
);
//stateParams wordt verwijderd en vervangen door post
//stateParams wordt gebruikt om Id van een URL op te halen en laadde de desbetreffende post op
app.controller('PostsCtrl', [
		'scope',
		'posts',
		'post',
		'auth',
		function($scope, posts, post){
			//$scope.post = posts.posts[$stateParams.id];
			$scope.isLoggedIn = auth.isLoggedIn;
			$scope.post = post;
		$scope.addComment = function(){
			if($scope.body === '')
			{return;}
			$scope.addComment(post._id, {
			    body: $scope.body,
			    author: 'user',}).success(function(comment){
			     $scope.post.comments.push(comment);
			   });
			/*$scope.post.comments.push({
				body: $scope.body,
				author: 'user',
				upvotes: 0
				});*/
			$scope.body = '';
			};
		$scope.incrementUpvote = function(comment){
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
	//aanmaken van register functie om de gebruiker te posten met /register route
	//en saves the token returned.
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
		//create register en logIn method on scope
		//zo worden de respectievelijke methoden van auth.factory aangeroepen
		//error gaat er voor zorgen dat de foutmelding op het scherm verschijnt
		//geen errors dan gaat terug naar de home state
		$scope.register = function(){
			auth.register($scope.user).error(function(error){
				$scope.error = error;
			}).then(function(){
				$state.go('home');
			});
		};

		$scope.logIn = function(){
			auth.logIn($scoper.user).error(function(error){
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
