var mongoose = require('mongoose');

var ClusterSchema = new mongoose.Schema({
  name: String,
  type: String,
  lastUpdated: Date,
  manager: {hostname: String,
            ipaddress: String,
            alive: Boolean,
	          mem_percent_used: Number,
            disk_percent_used: Number,
            low_resources: Boolean,
            numCPU: Number,
            RAM: Number},
  systems: [{hostname: String,
             ipaddress: String,
             alive: Boolean,
             mem_percent_used: Number,
             disk_percent_used: Number,
             low_resources: Boolean,
             suspended: Boolean,
             numCPU: Number,
             RAM: Number}],
});

module.exports = mongoose.model('Cluster', ClusterSchema);
