var express = require('express');
var router = express.Router();

/* Get home page. */
router.get('/', function(req, res) {
  res.render('index', { title: 'Dictionary App' });
});


var mongoose = require('mongoose');
var Dict = mongoose.model('Dict');

/* Get /dicts listing. */
router.get('/dict', function(req, res, next){
	Dict.find(function(err, entry){
		if(err) return next(err);
		res.json(entry);
	});
});

/* Post an entry to the dictionary. */
router.post('/dict', function(req, res, next) {
  	Dict.create(req.body, function (err, entry) {
    	if (err) return next(err);
    	res.json(entry);
  	});
});

/* Get a single entry, found by id. */
router.get('/dict/:id', function(req, res, next) {
  	Dict.findById(req.params.id, function (err, entry) {
    	if (err) return next(err);
    	res.json(entry);
  	});
});

/* Edit an entry, found by id. */
router.put('/dict/:id', function(req, res, next) {
  	Dict.findByIdAndUpdate(req.params.id, {
      $set: {key: req.body.key, value: req.body.value}}, {upsert: true}, function (err, entry) {
    	if (err) return next(err);
    	res.json(entry);
  	});
});

/* Delete an entry, found by id. */
router.delete('/dict/:id', function(req, res, next) {
    Dict.findByIdAndRemove(req.params.id, req.body, function (err, entry) {
      if (err) return next(err);
      res.json(entry);
    });
});


module.exports = router;
