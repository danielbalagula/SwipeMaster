var jwt = require('jsonwebtoken');
var config = require('./config');

module.exports = function(req,res,next){
	var bearerHeader = req.headers['authorization'];
	var token;
	req.authenticated = false;
	req.decoded = null;
	if (bearerHeader){
		var bearer = bearerHeader.split(" ");
		token = bearer[1];
		jwt.verify(token, config.secret, function (err, decoded){
			if (err){
				console.log(err);
			} else {
				req.decoded = decoded;
				req.authenticated = true;
			}
			next();
		});
	} else {
		next();
	}
}

