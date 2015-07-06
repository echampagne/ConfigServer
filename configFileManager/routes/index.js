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

/* Create a new cluster */
router.post('/clusters', auth, function (req, res, next) {
    Cluster.create(req.body, function (err, cluster) {
      if (err) return next(err);
      res.json(cluster);
    });
});


/* Return an individual cluster */
router.get('/clusters/:id', function (req, res, next) {
  Cluster.findById(req.params.id, function (err, cluster){
      if(err) { return next(err); }
      res.json(cluster);
  });
});


/* Delete a cluster */
router.delete('/clusters/:id', auth, function (req, res, next) {
    Cluster.findByIdAndRemove(req.params.id, req.body, function (err, cluster) {
      if (err) return next(err);
      res.json(cluster);
    });
});


// ex: curl http://127.0.0.1:3000/clusters/559a893fce3d73381cb40479 -d "hostname=testmhostname&ipaddress=testdelip&alive=testalive"
/* Create a system for a particular cluster */
router.post('/clusters/:id', auth, function (req, res, next){
  Cluster.findByIdAndUpdate(req.params.id,
                            {$push: {systems: {hostname: req.body.hostname,
                                              ipaddress: req.body.ipaddress,
                                              alive: req.body.alive
                                              }}},
                            {upsert: true},
                            function (err, system){
    if(err){ return next(err); }
    res.json(req.body);
  })
});


/* Edit a system in a cluster -- TODO: Implement this for the new schema */
router.put('/clusters/:id', functison (req, res, next) {
    Cluster.findByIdAndUpdate(req.params.id, {
      $set: {key: req.body.key, value: req.body.value}}, {upsert: true}, function (err, entry) {
      if (err) return next(err);
      res.json(entry);
    });
});


// ex: curl -X DELETE http://127.0.0.1:3000/clusters/559a893fce3d73381cb40479/system -d "hostname=testmhostname2&ipaddress=testdelip2&alive=testalive2"
/*
   Delete an system for a cluster.
   data apparently can't be sent in a delete request, so had to use param in url
*/
router.delete('/clusters/:id/:systemId', auth, function (req, res, next) {
    Cluster.findByIdAndUpdate(req.params.id,
                              {$pull: {systems: {_id: req.params.systemId }}},
                              function (err, system) {
      if (err){ return next(err) };
      res.json(system);
    });
});

/* Register route; creates a user given a username and password */
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


/* Login route; authenticates the user and returns a token to the client */
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

