var mongoose = require('mongoose');

var ClusterSchema = new mongoose.Schema({
  name: String,
  manager: {hostname: String,
            ipaddress: String,
            alive: String},
  systems: [{hostname: String,
             ipaddress: String,
             alive: String}],
});

module.exports = mongoose.model('Cluster', ClusterSchema);
