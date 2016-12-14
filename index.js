var express = require('express');
var router = express.Router();


/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

/*Code toegevoegd gebruiker: begin
importeren van mongoose
*/
var mongoose = require('mongoose');
//variabelen voor Post en Comment models, passport, User model,
//jwt, auth
var Post = mongoose.model('Post');
var Comment = mongoose.model('Comment');
var passport = require('passport');
var User = mongoose.model('User');
var jwt = require('express-jwt');
var auth = jwt({secret: 'SECRET', userProperty: 'payload'});

//POST OBJECT
//get-methode: definieerd de URL voor de route , bevat alle posts
//posts en de functie
//handeld de request af
//request handler: de query find zorgt ervoor dat alle post aanwezig in de
//database wordt getoond.
router.get('/posts', function(req, res, next){
	Post.find(function(err, posts){
	    if (err){
		   return next(err);
	    }
//res.json: wordt gebruikt om de gevonden posts aan de gebruiker te tonen
	    res.json(posts);
	});
});

//toevoegen van nieuwe post
router.post('/posts', auth, function(req, res, next){
	var post= new Post(req.body);
  post.author = req.payload.username;
	post.save(function(err, post){
		if(err){
		   return next(err);
		}
		res.json(post);
	});
});

//preloading posts
//param()function: automatisch laden van een object
router.param('post',function(req, res, next, id){
	var query = Post.findById(id);

	query.exec(function(err, post){
		if(err) {
			return next(err);
		}
		if(!post){
			return next(new Error('can \'t find post'));
		}
		req.post = post;
		return next();
	});
});

//returns a single post
router.get('/posts/:post', function(req, res, next){
	//de method populate(): simultaan ophalen van de comments en posts
	req.post.populate('comments', function(err, post){
		if(err){
			return next(err);
		}
		res.json(req.post);
	});
});

//maakt een route voor upvote post
router.put('/posts/:post/upvote', auth, function(req, res, next){
	req.post.upvote(function(err, post){
		if (err) {
			return next(err);
		}
		res.json(post);
	});
});

//COMMENTS OBJECT
//voegt nieuwe comment toe aan post
router.post('/posts/:post/comments', auth, function(req, res, next){
	var comment = new Comment(req.body);
	comment.post = req.post;
  comment.author = req.payload.username;
	comment.save(function(err, comment){
		if(err) {
			return next(err);
		}
		req.post.comments.push(comment);
		req.post.save(function(err, post){
		if (err) {
			return next (err);
		}
		res.json(comments);
		});
	});
});

//aanmaken route voor upvote comment
router.put('/posts/:post/comments/:comment/upvote', auth, function(req, res, next){
	req.post.upvote(function(err, post){
		if(err){
			return next(err);
		}
		res.json(post);
	});
});

//add /register ==> voor de login gebruikers
router.post('/register', function(req, res, next){
  if(!req.body.username || !req.body.password){
    return res.status(400).json({message:'Please fill out all fields'});
  }
  var user = new User();
  user.username = req.body.username;
  user.setPassword(req.body.password)
  user.save(function (err){
    if(err) {
      return next(err);
    }
    return res.json({token: user.generateJWT()})
  });
});
//login route en authenticatie van user en token
router.post('/login', function(req, res, next){
  if(!req.body.username || !req.body.password){
    return res.status(400).json({message: 'Please fill out all fields'});
  }
  passport.authenticate('local', function(err, user, info){
    if(err){
      return next(err);
    }
    if (user){
      return res.json({token: user.generateJWT()});
    } else {
      return res.status(401).json(info);
    }
  })
    (req,res,next);
});
/*Code toegevoegd gebruiker: einde*/

module.exports = router;
