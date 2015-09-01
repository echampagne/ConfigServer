var mongoose = require('mongoose');

var DeploySchema = new mongoose.Schema({
  isDeploying: Boolean
});

module.exports = mongoose.model('Deploy', DeploySchema);
