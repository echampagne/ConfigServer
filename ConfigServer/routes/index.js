module.exports = function(io) {
  var express = require('express');
  var router = express.Router();

  var mongoose = require('mongoose');
  var passport = require('passport');
  var jwt = require('express-jwt');
  //var user = require('../authorisation.js');
  var spawn = require("child_process").spawn;
  var fs = require('fs'), path = require('path');
  var PythonShell = require('python-shell');
  var cp = require("child_process");
  var url = require('url');
  var Busboy = require('busboy');

  var Cluster = mongoose.model('Cluster');
  var User = mongoose.model('User');
  var Property = mongoose.model('Property');
  var Deploy = mongoose.model('Deploy');

// note: secret is currently hardcoded.. change this before use
var auth = jwt({secret: 'SECRET', userProperty: 'payload'});

  /* Get home page. */
  router.get('/', function(req, res) {
    res.render('index');
  });


  /* Return a list of clusters
    note that this endpoint is hit every 30 seconds to update the angular view */
  router.get('/clusters', auth, function(req, res, next){
    Cluster.find(function(err, clusters){
      if(err) return next(err);
      res.json(clusters);
    });
  });


  /* Return the list of properties */
  router.get('/properties', auth, function(req, res, next){
    Property.find(function(err, properties){
      if(err) return next(err);
      res.json(properties)
    });
  });

  /* Return the a property found by key. Returns {'key':key, 'value':null} if key doesn't exist */
  router.post('/properties/:key', auth, function(req, res, next){
    Property.findOne({key : req.params.key}, function (err, properties){
      if(!properties) {
        ret_dict = {'key' : req.params.key, 'value': null, 'description': null};
        return res.json(ret_dict);
      }
      res.json(properties)
    });
  });

  /* Edit a property */
  router.put('/edit/properties/:id', auth, function (req, res, next){
    var objUpdate = {};
    if (req.body.key) objUpdate.key = req.body.key;
    if (req.body.value) objUpdate.value = req.body.value;1
    if (req.body.description) objUpdate.description = req.body.description;
    var setObj = { $set : objUpdate};

    Property.findByIdAndUpdate(req.params.id,
      setObj, {'new' : true}, function (err, property){
      if(err) return next(err);
      res.json(property);
    })
  })


  /* Creates a property. Edits value if key already exists. */
  router.post('/add/properties', auth, function (req, res, next){
    var objUpdate = {};
    if (req.body.key) objUpdate.key = req.body.key;
    if (req.body.value) objUpdate.value = req.body.value;
    if (req.body.description) objUpdate.description = req.body.description;
    var setObj = { $set : objUpdate};

    Property.findOneAndUpdate({key : req.body.key },
      setObj, {upsert: true, 'new': true}, function (err, property){
        if(err) return next(err);
        res.json(property);
    })
   });

  /* Delete a property by key */
  router.post('/delete/properties/:key', auth, function(req, res, next){
    Property.findOneAndRemove({key : req.params.key}, req.body, function (err, property){
      if(err) return next(err);
      res.json(property);
    });
  });

  /* Delete a property. Find by id.. used in gui (id guarranteed to exist and be unique) */
  router.delete('/properties/id/:id', auth, function(req, res, next){
    Property.findByIdAndRemove(req.params.id, req.body, function (err, property){
      if(err) return next(err);
      res.json(property);
    });
  });



  /* Create a cluster. Cluster found by name. Edit cluster if name already exists */
  router.post('/clusters', auth, function (req, res, next) {
    var objUpdate = {};
    if (req.body.name) objUpdate.name = req.body.name;
    if (req.body.type) objUpdate.type = req.body.type;
    objUpdate.lastUpdated = new Date();
    var setObj = { $set : objUpdate};
    if (req.body.hostname) setObj.$set['manager.hostname'] = req.body.hostname;
    if (req.body.ipaddress) setObj.$set['manager.ipaddress'] = req.body.ipaddress;
    if (req.body.alive != null) setObj.$set['manager.alive'] = req.body.alive;
    if (req.body.numCPU) setObj.$set['manager.numCPU'] = req.body.numCPU;
    if (req.body.RAM) setObj.$set['manager.RAM'] = req.body.RAM;

    Cluster.findOneAndUpdate({name : req.body.name},
      setObj, {upsert : true, 'new': true},
      function (err, cluster) {
        if (err) return next(err);
        res.json(cluster);
    });
  });


    /* Edit a cluster. Find by id */
  router.put('/clusters/:id', auth, function (req, res, next) {
    var objUpdate = {};
    if (req.body.name) objUpdate.name = req.body.name;
    if (req.body.type) objUpdate.type = req.body.type;
    objUpdate.lastUpdated = new Date();
    var setObj = { $set : objUpdate};
    if (req.body.hostname) setObj.$set['manager.hostname'] = req.body.hostname;
    if (req.body.ipaddress) setObj.$set['manager.ipaddress'] = req.body.ipaddress;
    if (req.body.alive != null) setObj.$set['manager.alive'] = req.body.alive;

    Cluster.findByIdAndUpdate(req.params.id,
      setObj, {'new':true},
      function (err, cluster) {
        if (err) return next(err);
        res.json(cluster);
    });
  });


  /* DELETE a cluster by name */
  router.delete('/clusters/:cluster_name', auth, function (req, res, next) {
      Cluster.findOneAndRemove({name: req.params.cluster_name}, req.body, function (err, cluster) {
        if (err) return next(err);
        res.json(cluster);
      });
  });


  /* Return an individual cluster found by name*/
  router.post('/clusters/:cluster_name', auth, function (req, res, next) {
    Cluster.findOne({name: req.params.cluster_name}, function (err, cluster){
        if(err) { return next(err); }

        if(cluster){
          // first copy systems by value for deletion of suspended systems
          var systemsClone = [];
          cluster.systems.forEach( function(system){
           systemsClone.push(system);
          })

          // remove suspended systems from return object
          systemsClone.forEach( function(system){
           if(system.suspended){
             var index = cluster.systems.indexOf(system);
             cluster.systems.splice(index, 1);
           }
          })
          res.json(cluster);
        }
    });
  });

  /* Return a cluster given system IP */
  router.post('/get/cluster/system/:system_ip', function (req, res, next){
    Cluster.findOne( {$or: [
  				{'systems.ipaddress' : req.params.system_ip},
  				{'manager.ipaddress' : req.params.system_ip}
  		         ]
  		   },
         function(err, cluster){
           if(err) return next(err);

           if(cluster){
             // first copy systems by value for deletion of suspended systems
             var systemsClone = [];
             cluster.systems.forEach( function(system){
              systemsClone.push(system);
             })

             // remove suspended systems from return object
             systemsClone.forEach( function(system){
              if(system.suspended){
                var index = cluster.systems.indexOf(system);
                cluster.systems.splice(index, 1);
              }
             })
             res.json(cluster);
           }
           if(!cluster){
            console.log('not found');
            res.json({});
           }
         });
  });

  /* Checks if each cluster hasn't been updated in 15 minutes
     If it hasn't, sets all systems to not alive.*/
  router.get('/status/clusters', function (req, res, next){
    Cluster.find(function(err, clusters){
      if(err) return next(err);
      var currentTime = new Date();
      clusters.forEach( function(cluster){
        if(cluster.lastUpdated){
          if( (currentTime.getTime() - cluster.lastUpdated.getTime())/(60*1000) >= 15  ){
            cluster.manager.alive = false;
            cluster.systems.forEach( function(system){
              system.alive = false;
            });
          }
        }
        // if the cluster has no last updated field set the time to now
        else{
          cluster.lastUpdated = currentTime;
        }

        cluster.save(function(err){
          if(err) return err;
        });
      });
      // save any changes made
      res.json(clusters);
    });
  });

  /* Create a system for a particular cluster (found by name as url param) */
  router.post('/clusters/:cluster_name/system', auth, function (req, res, next){
    Cluster.findOneAndUpdate({name: req.params.cluster_name},
      {
        $push: { systems: {
                            hostname: req.body.hostname,
                            ipaddress: req.body.ipaddress,
                            alive: req.body.alive,
                            numCPU: req.body.numCPU,
                            RAM: req.body.RAM
                          }
               },
        $set: { lastUpdated : new Date() }
      }, function (err, system){
        if(err){ return next(err); }
        res.json(req.body);
    });
  });

  /* Get a system */
  router.get('/clusters/:cluster_name/system/:system_hostname', auth, function (req, res, next) {
    Cluster.findOne({'systems.hostname' : req.params.system_hostname},
                    function (err, system){
        if(err) { return next(err); }
        if(system){
          res.json(system);
        }
    });
  });


  /*
     Edit a system (found by name) for a cluster found by hostname.
  */
  router.post('/clusters/:cluster_name/system/:system_hostname', auth, function (req, res, next){
    var objUpdate = {};
    objUpdate.lastUpdated = new Date();
    var setObj = { $set : objUpdate};
    if (req.body.hostname) setObj.$set['systems.$.hostname'] = req.body.hostname;
    if (req.body.ipaddress) setObj.$set['systems.$.ipaddress'] = req.body.ipaddress;
    if (req.body.alive != null) setObj.$set['systems.$.alive'] = req.body.alive;
    // delete these out later for editing cpu/ram
    if (req.body.numCPU) setObj.$set['systems.$.numCPU'] = req.body.numCPU;
    if (req.body.RAM) setObj.$set['systems.$.RAM'] = req.body.RAM;

    Cluster.findOneAndUpdate(
      {'systems.hostname' : req.params.system_hostname },
      setObj, {'new': true}, function (err, system){
      if(err) return next(err);
      res.json(system);
    });
  });

  router.post('/suspend/clusters/:cluster_name/system/:system_hostname', auth, function (req, res, next){
    var objUpdate = {};
    objUpdate.lastUpdated = new Date();
    var setObj = { $set : objUpdate};
    if (req.body.suspend != null) setObj.$set['systems.$.suspended'] = req.body.suspend;

    Cluster.findOneAndUpdate(
      {'systems.hostname' : req.params.system_hostname },
      setObj, {'new': true}, function (err, system){
      if(err) return next(err);
      res.json(system);
    });
  });


  /* Expects JSON containing total/available memory, total/available HDD space,
      and low resources boolean
      returns calculated available percentage as JSON */
  router.post('/heartbeat/system/:system_ip', auth, function (req, res, next){
    var objUpdate = {};
    objUpdate.lastUpdated = new Date();
    var setObj = { $set : objUpdate};
    var isManager=false;
    var currentTime = new Date();


    Cluster.findOne({'manager.ipaddress' : req.params.system_ip},
   		 function(err, manager){
  	    if(err) return next(err);
  	    if(!manager) isManager=false;
        if(manager){
          isManager=true;
          manager.lastUpdated = currentTime;
          // if an empty dict is received, manager is not alive
  				if(Object.keys(req.body).length === 0){
  					manager.manager.alive = false;
            manager.save(function(err){
              if(err) return err;
            });
            // note that this emits update to all clients
            io.emit('update');
            res.json(manager);
   				}
  			  else{
            // Manager found and is alive, update accordingly.
  					manager.manager.alive = true;
  					if(req.body.total_mem && req.body.avail_mem)
   					  manager.manager.mem_percent_used = (((req.body.total_mem - req.body.avail_mem)/req.body.total_mem)*100).toFixed(2);

  					if(req.body.total_disk_space && req.body.avail_disk_space)
  					  manager.manager.disk_percent_used = (((req.body.total_disk_space - req.body.avail_disk_space)/req.body.total_disk_space)*100).toFixed(2);

  					if(req.body.low_resources != null) manager.manager.low_resources = req.body.low_resources;

            manager.save(function(err){
  			      if(err) return err;
  			    });
            // note that this emits update to all clients
            io.emit('update');
  			    res.json(manager);
          }
  	    }
  	   }); // end of trying to find ipaddress in managers

    // ip not in manager, so check in systems
    if(!isManager){
      // first set up system updates
      setObj.$set['lastUpdated'] = currentTime;
      if(Object.keys(req.body).length === 0){
        setObj.$set['systems.$.alive'] = false;
      }
      else{
        setObj.$set['systems.$.alive'] = true;
        if(req.body.total_mem && req.body.avail_mem)
          setObj.$set['systems.$.mem_percent_used'] = (((req.body.total_mem-req.body.avail_mem)/req.body.total_mem)*100).toFixed(2);

        if(req.body.total_disk_space && req.body.avail_disk_space)
          setObj.$set['systems.$.disk_percent_used'] = (((req.body.total_disk_space-req.body.avail_disk_space)/req.body.total_disk_space)*100).toFixed(2);

        if(req.body.low_resources != null)
          setObj.$set['systems.$.low_resources'] = req.body.low_resources;
      }

      // then find the system if it exists and update.
      // if not found, SHOULD return empty dict {} - currently doesn't, headers error
      Cluster.findOneAndUpdate({'systems.ipaddress' : req.params.system_ip },
        setObj, {'new' : true}, function (err, system){
          if(err) return next(err);
          if(system){
            // note that this emits update to all clients
            io.emit('update');
    	      res.json(system);
          }
      });
    }
  });

  /*
     Delete an system (found by id) from a cluster (found by name).
     data apparently can't be sent in a delete request, so had to use param in url
     ex: curl -X DELETE http://127.0.0.1:3000/clusters/{clustername}/system/{systemid}
  */
  router.delete('/clusters/:cluster_name/system/:systemId', auth, function (req, res, next) {
      Cluster.findOneAndUpdate({name: req.params.cluster_name},
                                {$pull: {systems: {_id: req.params.systemId }}},
                                function (err, system) {
        if (err){ return next(err) };
        if(system) {
          res.json(system);
        }
      });
  });

  // find and set if it exists, create if it doesn't
  router.post('/setDeploy', function (req, res, next){
    Deploy.findOne( {$or: [
          {'isDeploying' : true},
          {'isDeploying' : false}]
        }, function(err, deploying){
      if(err) return next(err);
      if(deploying){
        deploying.isDeploying = req.body.isDeploying;

        deploying.save(function(err){
          if(err) return err;
        });
        res.json(deploying);
      }
    });
  });

  router.get('/getDeploy', function (req, res, next){
    Deploy.findOne(function(err, deploying){
      if(err) return next(err);
      if(deploying) res.json(deploying);
    });
  });

  router.post('/addDeploy', function (req, res, next){
    console.log('/addDeploy hit');
    Deploy.create({isDeploying: req.body.isDeploying},
        function (err, newDoc){
          console.log('created doc: ');
          console.log(newDoc);
          if(err) return next(err);
          res.json(newDoc);
        });
  });

  //curl -X POST 192.168.1.8:8082/resetIsDeploying
  router.post('/resetIsDeploying', function (req, res, next){
    Deploy.findOneAndUpdate({$or: [
          {'isDeploying' : true},
          {'isDeploying' : false}]
        }, {$set:{'isDeploying': false}},
        function (err, doploy){
          if(err) return next(err);
          res.json(doploy);
        });
  });

  router.delete('/deleteDeploy/:id', function (req, res, next ){
    Deploy.findByIdAndRemove(req.params.id, function(err, doc){
      if(err) return next(err);
      res.json(doc);
    });
  });


  router.get('/execDeployer', function(req, res){
    //Set isDeploying to true
    Deploy.findOne( {$or: [
          {'isDeploying' : true},
          {'isDeploying' : false}]
        }, function(err, deploying){
      if(err) return next(err);
      if(deploying){
        deploying.isDeploying = true;

        deploying.save(function(err){
          if(err) return err;
        });
      }
    });

    var url_parse = url.parse(req.url, true);
    deployInfo = JSON.parse(url_parse.query.info);

    //first we write to the config file

    fs.writeFile(process.env.HOME + "/Deployer/config.py", url_parse.query.config, function(err) {
      if (err) throw err;
      console.log('Saved config');
    });

    //then we generate the execution command to run the deployer
    argsList = [];

    argsList.push('--SKIP_CHECK_CONFIG');
    if (deployInfo.deployFrom === 'zipfiles') {
      if (deployInfo.deployManager) argsList.push("--mz");
      if (deployInfo.deployPipeline) argsList.push("--pz");
    } else {
      if (deployInfo.deployManager) argsList.push("--m");
      if (deployInfo.deployPipeline) argsList.push("--p");
      argsList.push(deployInfo.deployFrom === "manager3(dev)" ? "--REMOTE_DEPLOY_FROM_MANAGER3" : "--REMOTE_DEPLOY_FROM_SYSTEM4");
    }
    if (deployInfo.additionalArgs) argsList.push(deployInfo.additionalArgs);
    console.log(argsList);

    var options = {
      mode: 'text',
      pythonPath: process.env.HOME + '/Deployer/env/bin/python',
      pythonOptions: ['-u'],
      scriptPath: process.env.HOME +'/Deployer',
      args: argsList
    };

    res.writeHead(200, { "Content-Type": "text/event-stream",
                         "Cache-control": "no-cache" });
    res.write("\n");

    var pyshell = new PythonShell('runDeployer.py', options);
    pyshell.on('message', function (message) {
      // received a message sent from the Python script (a simple "print" statement)
      console.log(message);
      res.write('data: ' + message.toString() + "\n\n");
    });

    // end the input stream and allow the process to exit
    pyshell.end(function (err) {
      if (err) {
        console.log(err);
        res.write('data: runDeployer threw exception\n\n');
      }
      console.log('finished');
      res.write('data: ##FINISHED##\n\n');
      res.end('\n\n');

      //Set isDeploying to false
      Deploy.findOne( {$or: [
            {'isDeploying' : true},
            {'isDeploying' : false}]
          }, function(err, deploying){
        if(err) return next(err);
        if(deploying){
          deploying.isDeploying = false;

          deploying.save(function(err){
            if(err) return err;
          });
        }
      });

    });
  });


  /* Register endpoint; creates a user given a username and password
     Requires auth token to register, so not just anyone can
  */
  router.post('/register', function(req, res, next){
    if(!req.body.username || !req.body.password){
      return res.status(400).json({message: 'Please fill out all fields'});
    }

    var user = new User();

    user.username = req.body.username;

    user.setPassword(req.body.password)

    user.save(function (err){
      if(err){ return next(err); }

      return res.json({token: user.generateJWT()})
    });
  });

  // Given a username, find and delete that user.
  router.post('/deleteUser', auth, function(req, res, next){
    if(!req.body.username){
      return res.status(400).json({message: 'Please enter a username'});
    }

    User.findOneAndRemove({username : req.body.username}, function(err, user){
      if(err) return next(err);
      res.json(user);
    });
  });

  /* Login endpoint; authenticates the user and returns a token to the client */
  router.post('/login', function(req, res, next){
    if(!req.body.username || !req.body.password){
      return res.status(400).json({message: 'Please fill out all fields'});
    }

    // authenticate local uses the LocalStrategy middleware
    passport.authenticate('local', function(err, user, info){
      if(err){ return next(err); }

      if(user){
        return res.json({token: user.generateJWT()});
      } else {
        return res.status(401).json(info);
      }
    })(req, res, next);
  });

  // Given a username and control, add that control to the user's control list
  // Note that by using the addToSet mongo operator, the values of this list stay unique.
  router.post('/user/controls', auth, function(req, res, next){
    if(!req.body.username){
      return res.status(400).json({message: 'Please enter a username'});
    }

    User.findOneAndUpdate({username : req.body.username},
      {$addToSet: {control_list: req.body.control} }, {'new':true},
      function(err, user){
        if(err) return next(err);
        if(user) res.json(user);
      });
  });

  // Given a username and control, remove that control from the user's control list
  router.post('/delete/user/controls', auth, function(req, res, next){
    if(!req.body.username){
      return res.status(400).json({message: 'Please enter a username'});
    }

    User.findOneAndUpdate({username: req.body.username},
      {$pull: {control_list: req.body.control } }, {'new':true},
      function(err, user){
        if(err) return next(err);
        if(user) res.json(user);
      });
  });

  // Given a username, find and return that user's information
  router.post('/user', auth, function(req, res, next){
     if(!req.body.username){
      return res.status(400).json({message: 'Please enter a username'});
    }

    User.findOne({username: req.body.username},
      function(err, user){
        if(err) return next(err);

        if(user){
          console.log(user);
          return res.json(user);
        }
        if(!user){
          return null;
        }
      })
  });

  /* Login endpoint; destroys the user's session */
  router.post('/logout', function(req, res, next){
    req.session.destroy();
    res.status(200).json({status: 'Bye!'});
  });

  router.post('/upload', function (req, res) {
      var busboy = new Busboy({ headers: req.headers });
      var fname = "";
      busboy.on('file', function(fieldname, file, filename, encoding, mimetype) {
        if (filename.search(/manager/i) > -1) {
          console.log("Renaming " + filename + " to Manager.zip");
          fname = 'Manager.zip';
        } else if (filename.search(/pipeline/i) > -1) {
          console.log("Renaming " + filename + " to PipelineEngine.zip");
          fname = 'PipelineEngine.zip';
        }

        var saveTo = path.join('/home/configserver/codebase/', fname);
        console.log('Uploading: ' + saveTo);
        file.pipe(fs.createWriteStream(saveTo));
      });
      busboy.on('finish', function() {
        console.log('Upload complete.');
        res.writeHead(200, { 'Connection': 'close' });
        res.end("Upload Finished");
      });
      return req.pipe(busboy);
  });
  return router;
};


