var express = require('express');
var app = express();
var mongoose = require('mongoose');
var logger = require('morgan');
var bodyParser = require('body-parser');
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');
var auth = require('./auth');
var find_user = require('./find_user');
var methodOverride = require('method-override');
var config = require('./config');
var User = require('./models/user');
var Startup = require('./models/startup');
var MongoClient = require('mongodb').MongoClient;
var shortid = require('shortid');
var helper = require('sendgrid').mail;

app.use(logger('dev'));
app.use(bodyParser.urlencoded({'extended':'true'}));
app.use(bodyParser.json());
app.use(bodyParser.json({type: 'application/vnd.api+json'}));
app.use(methodOverride());
app.set('superSecret', config.secret);

const saltRounds = 10;

mongoose.connect(config.database);

var sendConfirmationEmail = function(email, token){
	var from_email = new helper.Email('noreply@startpath.com');
	var to_email = new helper.Email('db2791@nyu.edu');
	var mailPattern = /^[a-zA-Z0-9._-]+@nyu.edu$/;
	if (mailPattern.test('db2791@nyu.edu')){
		var subject = 'Confirm your StartPath App Account!';
		var content = new helper.Content('text/html', "<html>Hello, please click <a href='http://localhost:3000/verify/" + token + "'>here</a> to validate your account.</html>");
		var mail = new helper.Mail(from_email, subject, to_email, content);

		var sg = require('sendgrid')();
		var request = sg.emptyRequest({
			method: 'POST',
			path: '/v3/mail/send',
			body: mail.toJSON(),
		});

		sg.API(request, function(error, response) {
			console.log(response.statusCode);
			console.log(response.body);
			console.log(response.headers);
		});
	}
}

var sendRefferalEmail = function(from, to, show_from, callback){
	var from_email = new helper.Email('noreply@startpath.com');
	var to_email = new helper.Email('db2791@nyu.edu');
	var mailPattern = /^[a-zA-Z0-9._-]+@nyu.edu$/;
	if (mailPattern.test('db2791@nyu.edu')){
		var subject = 'You\'ve been invited to join StartPath!';
		if (show_from){
			var content = new helper.Content('text/html', "<html>Hi! You've been invited by " + from.substring(0, from.lastIndexOf("@")) + " to join StartPath! Please click <a href='http://localhost:3000/refer/" + to.substring(0, to.lastIndexOf("@")) + "'>here</a> to start!.</html>");
		} else {
			var content = new helper.Content('text/html', "<html>Hi! You've been invited to join StartPath! Please click <a href='http://localhost:3000/refer/" + to + "'>here</a> to start!.</html>");
		}
		var mail = new helper.Mail(from_email, subject, to_email, content);

		var sg = require('sendgrid')();
		var request = sg.emptyRequest({
			method: 'POST',
			path: '/v3/mail/send',
			body: mail.toJSON(),
		});

		console.log(to_email);

		sg.API(request, function(error, response) {
			console.log(response.statusCode);
			console.log(response.body);
			console.log(response.headers);
		});
	}
	callback();
}

app.get('/loggedin', auth, find_user, function(req, res){
	var response_string = "{}";
	if (req.isValidated) {
		var obj = JSON.parse(response_string);
		obj['isValidated'] = (req.isValidated);
		response_string = JSON.stringify(obj);
	}
	if (req.decoded == null){
		var obj = JSON.parse(response_string);
		obj['authenticated'] = ('false');
		response_string = JSON.stringify(obj);
	} else {
		var obj = JSON.parse(response_string);
		obj['authenticated'] = (req.decoded);
		obj['username']  = (req.user.username);
		response_string = JSON.stringify(obj);
	}
	var response_object = JSON.parse(response_string);
	res.send(response_object);
});

app.post('/sendreferral', function(req,res){
	User.findOne({username: req.body.recipient}, function(err, result){
		if (result) {
			res.json({
				message: "Account already registered with that e-mail address."
			});
		} else {
			sendRefferalEmail(req.body.sender, req.body.recipient, req.body.show_sender, function(){
				res.json({
					message: "Email has been sent to " + req.body.recipient + "!"
				});
			});
		}
	})
});

app.post('/register', [auth, find_user], function(req, res){
	if (req.decoded == null){
		User.findOne({username: req.body.username}, function(err, result){
			if (req.user) {
				res.json({
					success: false,
					message: "Username taken",
				});
			} else {
				bcrypt.genSalt(saltRounds, function(err, salt) {
					bcrypt.hash(req.body.password, salt, function(err, hash) {
						var newUser = new User({
							validationUrl: shortid.generate(),
							username: req.body.username,
							password: hash,
							isValidated: false,
							admin: false
						})
						newUser.save(function(err){
							if (err) throw err;
							var token = jwt.sign(
								{username: newUser.username},
								app.get('superSecret'),
								{expiresIn: '1d'}
							);
							sendConfirmationEmail(newUser.username, newUser.validationUrl);
							res.json({
								success: true,
								token: token,
								redirect: config.registerRedirect
							});
						})
					});
				});
			}
		})
	}
});

app.post('/login', [find_user, auth], function(req, res){
	if (req.decoded == null){
		User.findOne({'username':req.body.username}, function(err, user){
			if (req.user) {
				bcrypt.compare(req.body.password, user.password, function(err, result) {
					if (result){
						if (user.isValidated){
							var token = jwt.sign(
								{username: user.username},
								app.get('superSecret'),
								{expiresIn: '1d'}
							);
							res.json({
								success: true,
								token: token,
								redirect: config.loginRedirect
							});
						} else {
							res.json({
								success: false,
								message: "This e-mail address needs be verified."
							});
						}
					} else {
						res.json({
							success: false,
							message: "Incorrect password",
						});
					}
				});
			} else {
				res.json({
					success: false,
					message: "Account with that username not found",
				});
			}
		});
	}
});

app.get('/getstartups', auth, find_user, function(req, res){
	if (req.authenticated == false || !req.user){
		res.send("Your session has expired.");
	} else {
		MongoClient.connect(config.database, function(err, db) {
			db.collection('startups').aggregate([
				{ $match: { _id: { $nin: req.user.startups_seen } } },
				{ $sample: { size: 10 } },
			]).toArray(function(err,docs){
				res.send(docs);
			});
		});
	}
});

app.get('/getTags', auth, find_user, function(req, res){
	if (req.authenticated == false || !req.user){
		res.send("Your session has expired.");
	} else {
		res.json(req.user.startup_tags);
	}
});

app.post('/addTags', auth, find_user, function(req, res){
	console.log(req.body.startup_id);
	if (req.authenticated == false || !req.user){
		res.send("Your session has expired.");
	} else {
		User.findByIdAndUpdate(req.user._id,
			function(err, usr){
				console.log(req.user);
				res.json({success: true});
		});
	}
});

app.get('/getlikes', auth, find_user, function(req, res){
	if (req.authenticated == false){
		res.send("Your session has expired.");
	} else {
		Startup.find({
			_id: { $in: req.user.startups_liked }
		}, function(err, docs){
			res.json(docs);
		});
	}
});

app.post('/swipe', auth, find_user, function(req,res){
	if (req.authenticated == false){
		res.send("Your session has expired.");
	} else {
		var startup_id = mongoose.Types.ObjectId(req.body.startup_id);
		if (req.body.liked){
			User.findByIdAndUpdate(req.user._id,
				{$push: {startups_seen: startup_id, startups_liked: startup_id}},
				function(err, usr){
					console.log(req.user);
					res.json({success: true});
			});
		} else {
			User.findByIdAndUpdate(req.user._id,
				{$push: {startups_seen: startup_id, startups_rejected: startup_id}},
				function(err, usr){
					console.log(req.user);
					res.json({success: true});
			});
		}
	}
});

app.get('/verify/:shortid', function(req, res, next){
	User.update({validationUrl: req.params.shortid}, {
		isValidated: true
	}, function(err, numberAffected, rawResponse) {
		res.redirect('/');
	})
});

app.get('/refer/:id', function(req, res){
	res.redirect('/');
});

app.get('/', function(req, res){
	res.sendFile('C:/Users/Daniel/Desktop/app/public/index.html');
});

app.use(express.static(__dirname+'/public/'));

app.listen(3000, function () {
	console.log('StarPath listening on port 3000!');
});
