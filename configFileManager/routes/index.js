var express = require('express');
var router = express.Router();

/* Get home page. */
router.get('/', function(req, res) {
  res.render('index');
});


var mongoose = require('mongoose');
var passport = require('passport');
var jwt = require('express-jwt');

var Cluster = mongoose.model('Cluster');
var User = mongoose.model('User');

// note: secret is currently hardcoded.. change this before use
var auth = jwt({secret: 'SECRET', userProperty: 'payload'});


/* Return a list of clusters */
router.get('/clusters', function(req, res, next){
  Cluster.find(function(err, clusters){
    if(err) return next(err);
    res.json(clusters);
  });
});


/* This post also functions as a put method for manager info...
   Creates a new cluster if cluster name specified doesn't exist.
   If it does, update the manager's info
   ex: curl http://127.0.0.1/clusters -d "name=testing&hostname=testing1&ipaddress=testing2&alive=testing3"
        will either create a cluster or update an existing one with name : 'testing' to:
          name: 'testing', manager: {hostname : 'testing1', ipaddress: 'testing2', alive: 'testing3'}
*/
router.post('/clusters', function (req, res, next) {
    Cluster.findOneAndUpdate({name : req.body.name},
      {$set: {name: req.body.name, manager: {hostname: req.body.hostname,
                                            ipaddress: req.body.ipaddress,
                                            alive: req.body.alive
                                           }
            }
      }, {upsert: true},
      function (err, system) {
        if (err) return next(err);
        res.json(system);
    });
});

/* POST method not combined with PUT.
   Create a new cluster

  router.post('/clusters', function (req, res, next) {
    Cluster.create(req.body, function (err, cluster) {
      if (err) return next(err);
      res.json(cluster);
    });
  });
*/

/* PUT method not combined with POST
   Edit a cluster. Cluster found by name

  router.put('/clusters/:cluster_name', function (req, res, next) {
      Cluster.findOneAndUpdate({name : req.params.cluster_name},
        {$set: {name: req.body.name, manager: {hostname: req.body.hostname,
                                              ipaddress: req.body.ipaddress,
                                              alive: req.body.alive
                                             }
              }
        },
        function (err, system) {
          if (err) return next(err);
          res.json(system);
      });
  });
*/


/* Delete a cluster by name */
router.delete('/clusters/:cluster_name', function (req, res, next) {
    Cluster.findOneAndRemove({name: req.params.cluster_name}, req.body, function (err, cluster) {
      if (err) return next(err);
      res.json(cluster);
    });
});

/* DELETE method above done by id..
   Delete a cluster by id */
// router.delete('/clusters/:id', function (req, res, next) {
//     Cluster.findByIdAndRemove(req.params.id, req.body, function (err, cluster) {
//       if (err) return next(err);
//       res.json(cluster);
//     });
// });


/* Return an individual cluster found by name*/
router.get('/clusters/:cluster_name', function (req, res, next) {
  Cluster.findOne({name: req.params.cluster_name}, function (err, cluster){
      if(err) { return next(err); }
      res.json(cluster);
  });
});

/* GET method above done by id
   Return an individual cluster found by id*/
// router.get('/clusters/:id', function (req, res, next) {
//   Cluster.findById(req.params.id, function (err, cluster){
//       if(err) { return next(err); }
//       res.json(cluster);
//   });
// });




// ex: curl http://127.0.0.1:3000/clusters/{clusterid}/system -d "hostname=testmhostname&ipaddress=testdelip&alive=testalive"
/* Create a system for a particular cluster. Cluster found by id */
// router.post('/clusters/:id/system', function (req, res, next){
//   Cluster.findByIdAndUpdate(req.params.id,
//     {$push: {systems: {hostname: req.body.hostname,
//                       ipaddress: req.body.ipaddress,
//                       alive: req.body.alive
//                       }
//             }
//     },
//     function (err, system){
//       if(err){ return next(err); }
//       res.json(req.body);
//   });
// });


/* Create a system for a particular cluster (found by name as url param) */
router.post('/clusters/:cluster_name/system', function (req, res, next){
  Cluster.findOneAndUpdate({name: req.params.cluster_name},
    {$push: {systems: {hostname: req.body.hostname,
                      ipaddress: req.body.ipaddress,
                      alive: req.body.alive
                      }
            }
    },
    function (err, system){
      if(err){ return next(err); }
      res.json(req.body);
  });
});

/* Get a system */
router.get('/clusters/:cluster_name/system/:system_hostname', function (req, res, next) {
  Cluster.findOne({'systems.hostname' : req.params.system_hostname},
                  function (err, system){
      if(err) { return next(err); }
      res.json(system);
  });
});


/* Edit a system (found by name) for a cluster found by hostname.
   ex: curl -X PUT http://127.0.0.1:3000/{clustername}/system/{systemname} -d "hostname=test1&ipaddress=test2&alive=test3"
         where clustername and system exist.
   */
router.put('/clusters/:cluster_name/system/:system_hostname', function (req, res, next){
  Cluster.update(
    {'systems.hostname' : req.params.system_hostname },
    { $set : {
    'systems.$.hostname' : req.body.hostname,
    'systems.$.ipaddress' : req.body.ipaddress,
    'systems.$.alive' : req.body.alive
  }}, function (err, system){
    if(err) return next(err);
    console.log(req.body);
    res.json(system);
  });
});


/*
   Delete an system (found by id) from a cluster (found by name).
   data apparently can't be sent in a delete request, so had to use param in url
   ex: curl -X DELETE http://127.0.0.1:3000/clusters/{clustername}/system/{systemid}
*/
router.delete('/clusters/:cluster_name/system/:systemId', function (req, res, next) {
    Cluster.findOneAndUpdate({name: req.params.cluster_name},
                              {$pull: {systems: {_id: req.params.systemId }}},
                              function (err, system) {
      if (err){ return next(err) };
      res.json(system);
    });
});



/* Register endpoint; creates a user given a username and password */
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



module.exports = router;

