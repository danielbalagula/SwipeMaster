var mongoose = require('mongoose');
var Schema = mongoose.Schema;

module.exports = mongoose.model('Startup', new Schema({
	name: String,
	short_description: String,
	long_description: String,
	logo_url: String,
	video_url: String,
	date_founded: Number,
	stage: Number,
	industry: String
}));
