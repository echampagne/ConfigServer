var mongoose = require('mongoose');

var PropertySchema = new mongoose.Schema({
  key: String,
  value: mongoose.Schema.Types.Mixed,
  description: String
 });

module.exports = mongoose.model('Property', PropertySchema);
