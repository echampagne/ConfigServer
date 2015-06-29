var mongoose = require('mongoose');

var DictSchema = new mongoose.Schema({
	key: String,
	value: mongoose.Schema.Types.Mixed
});

module.exports = mongoose.model('Dict', DictSchema);
