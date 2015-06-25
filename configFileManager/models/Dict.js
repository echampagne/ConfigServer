var mongoose = require('mongoose');

var DictSchema = new mongoose.Schema({
	key: String,
	value: String
});

module.exports = mongoose.model('Dict', DictSchema);