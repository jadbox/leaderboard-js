var express = require('express'),
      bodyParser = require('body-parser'),
      app = express(),
      timeout = require('connect-timeout'),
      Router = require('./app-routes.js');

var db;
db = require('./redisdb.js'); // use Redis
//db = require('./localdb.js'); // use node server memory

var PORT = 3000;

//-----------------------------------------------------------------------------
// Entry point for the leaderboard server.
// Start by running: node server.js
//
// Requests and response content-type is: application/json
//
// Created by: Jonathan Dunlap
//-----------------------------------------------------------------------------

db.connect();
var router = new Router(db);

app.use(bodyParser.json({ type: 'application/json' }));
app.use(timeout('5s'));

// Handle event requests
app.post('/', router.routePostEvent.bind(router) );

// Delete the user by a DELETE call
app.delete('/', router.routeDeleteEvent.bind(router) );

// Start listener
var server = app.listen(PORT, function () {

  var host = server.address().address;
  var port = server.address().port;

  console.log('Leaderboard app listening at http://%s:%s', host, port);

});
