var User = require('./models/user');

module.exports = function(req,res,next){
	req.user = null;
	if (req.body.username != null){
		User.findOne({username: req.body.username}, function(err, found_user){
			req.user = found_user;
			if (found_user) {
				if (found_user.isValidated == false) {
					req.isValidated = 'false';
				} else {
					req.isValidated = 'true';
				}
			}
			next();
		});
	} else if (req.decoded){
		if (req.decoded.username != null){
			User.findOne({username: req.decoded.username}, function(err, found_user){
				if (found_user) {
					req.user = found_user;
					if (found_user.isValidated == false) {
						req.isValidated = 'false';
					} else {
						req.isValidated = 'true';
					}
					next();
				}
			});
		} else {
			req.user = null;
			next();
		}
	} else {
		req.user = null;
		next();
	}
}
