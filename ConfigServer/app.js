var express = require('express');
var http = require('http');
var path = require('path');
var favicon = require('static-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var mongoose = require('mongoose');
var passport = require('passport');
var schedule = require('node-schedule');
var request = require('request');

require('./models/Clusters');
require('./models/Users');
require('./models/Property');
require('./models/Deploy');

require('./config/passport');

mongoose.connect('mongodb://localhost/', function(err) {
    if(err) {
        console.log('connection error', err);
    } else {
        console.log('connection successful');
    }
});

var app = express();
var debug = require('debug')('my-application');
var socketio = require('socket.io');
app.set('port', 3001);
var server = app.listen(app.get('port'), function() {
  debug('Express server listening on port ' + server.address().port);
});

// Set socket to listen on the server
var io = require('socket.io').listen(server);
io.on('connection', function (socket) {
  console.log('server received client connection');

  socket.on('disconnect', function(){
    console.log('client disconnected');
  });
});

// view engine setup
app.set('views', path.join(__dirname, 'webcontent/ejs'));
app.set('view engine', 'ejs');

app.use(favicon());
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'webcontent')));
app.use(passport.initialize());

var routes = require('./routes/index')(io);
app.use('/', routes);


/*  Job to check if systems have been updated recently.
    Runs every 15 minutes.
*/
var rule = new schedule.RecurrenceRule();
rule.minute = new schedule.Range(0, 59, 15);
var j = schedule.scheduleJob(rule, function(){
    request('http://192.168.1.17:8082/status/clusters', function (error, response, body){
        if(!error && response.statusCode == 200){
            console.log(body);
        }
        if(error) console.log(error);
    });
});


/// catch 404 and forwarding to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

/// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.render('error', {
        message: err.message,
        error: {}
    });
});


module.exports = app;
