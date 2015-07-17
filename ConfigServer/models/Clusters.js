var mongoose = require('mongoose');

var ClusterSchema = new mongoose.Schema({
  name: String,
  type: String,
  manager: {hostname: String,
            ipaddress: String,
            alive: Boolean},
  systems: [{hostname: String,
             ipaddress: String,
             alive: Boolean,
             mem_percent_used: Number,
             disk_percent_used: Number,
             low_resources: Boolean}],
});

module.exports = mongoose.model('Cluster', ClusterSchema);
