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
var Property = mongoose.model('Property');

// note: secret is currently hardcoded.. change this before use
var auth = jwt({secret: 'SECRET', userProperty: 'payload'});


/* Return a list of clusters */
router.get('/clusters', function(req, res, next){
  Cluster.find(function(err, clusters){
    if(err) return next(err);
    res.json(clusters);
  });
});


/* Return the list of properties */
router.get('/properties', function(req, res, next){
  Property.find(function(err, properties){
    if(err) return next(err);
    res.json(properties)
  });
});

/* Return the a property found by key. Returns {'key':key, 'value':null} if key doesn't exist */
router.post('/properties/:key', function(req, res, next){
  Property.findOne({key : req.params.key}, function (err, properties){
    if(!properties) {
      ret_dict = {'key' : req.params.key, 'value': null};
      return res.json(ret_dict);
    }
    res.json(properties)
  });
});

/* Edit a property */
router.put('/edit/properties/:id', function (req, res, next){
  Property.findByIdAndUpdate(req.params.id,
    {$set : {key : req.body.key, value : req.body.value}}, function (err, property){
    if(err) return next(err);
    res.json(property);
  })
})


/* Creates a property. Edits value if key already exists. */
router.post('/add/properties', function (req, res, next){
    Property.findOneAndUpdate({key : req.body.key },
      {$set : {key : req.body.key, value : req.body.value}},
      {upsert: true}, function (err, property){
        if(err) return next(err);
        prop_dict = {'key' : req.body.key, 'value' : req.body.value};
        res.json(prop_dict);
    })
 });

/* Delete a property by key */
router.post('/delete/properties/:key', function(req, res, next){
  Property.findOneAndRemove({key : req.params.key}, req.body, function (err, property){
    if(err) return next(err);
    res.json(property);
  });
});

/* Delete a property. Find by id.. used in gui (id guarranteed to exist and be unique) */
router.delete('/properties/id/:id', function(req, res, next){
  Property.findByIdAndRemove(req.params.id, req.body, function (err, property){
    if(err) return next(err);
    res.json(property);
  });
});


/* Create a cluster. Cluster found by name. Edit cluster if name already exists */
router.post('/clusters', function (req, res, next) {
    Cluster.findOneAndUpdate({name : req.params.cluster_name},
      {$set: {name: req.body.name,
              type: req.body.type,
              manager: {hostname: req.body.hostname,
                        ipaddress: req.body.ipaddress,
                        alive: req.body.alive
                        }
            }
      }, {upsert : true},
      function (err, cluster) {
        if (err) return next(err);
        res.json(cluster);
    });
});


  /* Edit a cluster. Find by id */
router.put('/clusters/:id', function (req, res, next) {
    Cluster.findByIdAndUpdate(req.params.id,
      {$set: {name: req.body.name,
              type: req.body.type,
              manager: {hostname: req.body.hostname,
                        ipaddress: req.body.ipaddress,
                        alive: req.body.alive
                        }
            }
      },
      function (err, cluster) {
        if (err) return next(err);
        res.json(cluster);
    });
});


/* DELETE a cluster by name */
router.delete('/clusters/:cluster_name', function (req, res, next) {
    Cluster.findOneAndRemove({name: req.params.cluster_name}, req.body, function (err, cluster) {
      if (err) return next(err);
      res.json(cluster);
    });
});


/* Return an individual cluster found by name*/
router.get('/clusters/:cluster_name', function (req, res, next) {
  Cluster.findOne({name: req.params.cluster_name}, function (err, cluster){
      if(err) { return next(err); }
      res.json(cluster);
  });
});


/* Create a system for a particular cluster (found by name as url param) */
router.post('/clusters/:cluster_name/system', function (req, res, next){
  Cluster.findOneAndUpdate({name: req.params.cluster_name},
    {$push: {
    systems: {hostname: req.body.hostname,
              ipaddress: req.body.ipaddress,
              alive: req.body.alive
             }}
    }, function (err, system){
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


/*
   Edit a system (found by name) for a cluster found by hostname.
   ex: curl -X PUT http://127.0.0.1:3000/clusters/{clustername1}/system/{systemname} -d "hostname=test1&ipaddress=test2&alive=test3"
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
router.post('/register', auth, function(req, res, next){
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

/* Login endpoint; destroys the user's session */
router.post('/logout', auth, function(req, res, next){
  req.session.destroy(function (err) {
    res.redirect('/');
  });
});



module.exports = router;

