var express = require('express');
var router = express.Router();

var mongoose = require('mongoose');
var Dict = require('../models/Dict.js');

/* Get /dicts listing. */
router.get('/', function(req, res, next){
	Dict.find(function(err, dicts){
		if(err) return next(err);
		res.json(dicts);
	});
});

router.post('/', function(req, res, next) {
  	Dict.create(req.body, function (err, post) {
    	if (err) return next(err);
    	res.json(post);
  	});
});

router.get('/:id', function(req, res, next) {
  	Dict.findById(req.params.id, function (err, post) {
    	if (err) return next(err);
    	res.json(post);
  	});
});


router.put('/:id', function(req, res, next) {
  	Dict.findByIdAndUpdate(req.params.id, req.body, function (err, post) {
    	if (err) return next(err);
    	res.json(post);
  	});
});

router.delete('/:id', function(req, res, next) {
  	Dict.findByIdAndRemove(req.params.id, req.body, function (err, post) {
    	if (err) return next(err);
    	res.json(post);
  	});
});


module.exports = router;