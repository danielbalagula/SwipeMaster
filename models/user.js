var mongoose = require('mongoose');
var Schema = mongoose.Schema;

module.exports = mongoose.model('User', new Schema({
	isValidated: Boolean,
	validationUrl: String,
	name: String,
	username: String,
	password: String,
	admin: Boolean,
	startups_seen: [Schema.Types.ObjectId],
	startups_rejected: [Schema.Types.ObjectId],
	startups_liked: [Schema.Types.ObjectId],
	startup_tags: [{startup_id: Schema.Types.ObjectId, tags: [String]}]
}))
