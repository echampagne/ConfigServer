var mongoose = require('mongoose');

var PropertySchema = new mongoose.Schema({
  key: String,
  value: mongoose.Schema.Types.Mixed
 });

module.exports = mongoose.model('Property', PropertySchema);
