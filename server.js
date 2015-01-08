var express = require('express'),
      bodyParser = require('body-parser'),
      app = express(),
      router = require('./app-routes.js');

//-----------------------------------------------------------------------------
// Entry point for the leaderboard server.
// Start by running: node server.js
//
// Requests and response content-type is: application/json
//
// Created by: Jonathan Dunlap
//-----------------------------------------------------------------------------

var PORT = 3000;

app.use(bodyParser.json({ type: 'application/json' }));

// Handle event requests
app.post('/', router.routePostEvent.bind(router) );

// Delete the user by a DELETE call
app.delete('/', router.routeDeleteEvent.bind(router) );

var server = app.listen(PORT, function () {

  var host = server.address().address;
  var port = server.address().port;

  console.log('Example app listening at http://%s:%s', host, port);

});
