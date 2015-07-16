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
router.put('/edit/properties/:id', auth, function (req, res, next){
  var objUpdate = {};
  if (req.body.key) objUpdate.key = req.body.key;
  if (req.body.value) objUpdate.value = req.body.value;
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
  var setObj = { $set : objUpdate};

  Property.findOneAndUpdate({key : req.body.key },
    setObj, {upsert: true, 'new': true}, function (err, property){
      if(err) return next(err);
      console.log(property);
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
  var setObj = { $set : objUpdate};
  if (req.body.hostname) setObj.$set['manager.hostname'] = req.body.hostname;
  if (req.body.ipaddress) setObj.$set['manager.ipaddress'] = req.body.ipaddress;
  if (req.body.alive) setObj.$set['manager.alive'] = req.body.alive;


  Cluster.findOneAndUpdate({name : req.body.name},
    setObj, {upsert : true, 'new': true},
    function (err, cluster) {
      if (err) return next(err);
      console.log(cluster);
      res.json(cluster);
  });
});


  /* Edit a cluster. Find by id */
router.put('/clusters/:id', auth, function (req, res, next) {

  var objUpdate = {};
  if (req.body.name) objUpdate.name = req.body.name;
  if (req.body.type) objUpdate.type = req.body.type;
  var setObj = { $set : objUpdate};
  if (req.body.hostname) setObj.$set['manager.hostname'] = req.body.hostname;
  if (req.body.ipaddress) setObj.$set['manager.ipaddress'] = req.body.ipaddress;
  if (req.body.alive) setObj.$set['manager.alive'] = req.body.alive;

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
router.post('/clusters/:cluster_name', function (req, res, next) {
  Cluster.findOne({name: req.params.cluster_name}, function (err, cluster){
      if(err) { return next(err); }
      res.json(cluster);
  });
});


/* Create a system for a particular cluster (found by name as url param) */
router.post('/clusters/:cluster_name/system', auth, function (req, res, next){
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
router.post('/clusters/:cluster_name/system/:system_hostname', auth, function (req, res, next){
  var objUpdate = {};
  var setObj = { $set : objUpdate};
  if (req.body.hostname) setObj.$set['systems.$.hostname'] = req.body.hostname;
  if (req.body.ipaddress) setObj.$set['systems.$.ipaddress'] = req.body.ipaddress;
  if (req.body.alive) setObj.$set['systems.$.alive'] = req.body.alive;

  Cluster.findOneAndUpdate(
    {'systems.hostname' : req.params.system_hostname },
    setObj, {'new': true}, function (err, system){
    if(err) return next(err);
    res.json(system);
  });
});


/*
   Delete an system (found by id) from a cluster (found by name).
   data apparently can't be sent in a delete request, so had to use param in url
   ex: curl -X DELETE http://127.0.0.1:3000/clusters/{clustername}/system/{systemid}
*/
router.delete('/clusters/:cluster_name/system/:systemId', auth,   function (req, res, next) {
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

