//var db = require('./scoredb.js');

//-----------------------------------------------------------------------------
// Routing handlers for the leaderboard
// Created by: Jonathan Dunlap
//-----------------------------------------------------------------------------

var AppRoutes = function(db) {
  this.db = db;
};

// Global utility to respond with User Does Not Exist.
function sendNoUserError (id, res) {
  res.status(400).json({status: "Error: player id does not exist", playerID: id});
}

// Register player route
AppRoutes.prototype.registerPlayer = function(body, res) {
  var name = body.name;
  var playerID = this.db.registerPlayer(name, function(id) {
    res.status(201).json({status: "Success: registered player", playerID: id, name: name});
  });
};

// Set player score route
AppRoutes.prototype.saveScore = function(body, res) {
  var id = parseInt(body.playerID);
  var score = parseInt(body.score); // parse just in case score wasn't an int
  this.db.saveScore(id, score, function(success) {
    if(success) res.json({status: "Success: set player score", playerID: id, score: score});
    else sendNoUserError(id, res);
  });

};

// Get a range of player's scores route
AppRoutes.prototype.getScoreRange = function (body, res) {
  var start = body.range[0];
  var end = body.range[1];
  this.db.getScores(start,end, function(scores) {
    res.json({scores:scores});
  });
};

// Get a score by a specific user ID route
AppRoutes.prototype.getScoreByPlayerID = function (body, res) {
  var id = parseInt(body.playerID);
  this.db.getScore(id, function(score) {
    if(score===null) sendNoUserError(id, res);
    else res.json({status: "Success: recalled player score", playerID: id, score: score});
  });
};

// Enlists handlers for routes. The event ID corrisponds to their index.
AppRoutes.prototype.eventRoutes = function() {
  // Ensure handlers are bound to this scope
  return [
      this.registerPlayer.bind(this),
      this.saveScore.bind(this),
      this.getScoreRange.bind(this),
      this.getScoreByPlayerID.bind(this)
      ];
};

// Method to recieve incoming post requests
AppRoutes.prototype.routePostEvent = function(requst, res) {
  var body = requst.body;
  var eventHandlers = this.eventRoutes();
  // Get the event id
  var event = body.event === undefined ? 1 : parseInt(body.event);
  event -= 1; // Index needs to start at 0 for the lookup
  if(event >= 0 && event < eventHandlers.length) {
    eventHandlers[event](body, res);
  } else {
    // No corresponding event ID recieved
    res.status(400).json({status: "Invalid event ID!"});
  }
};

// Method to respond to player delete request
// Request type: DELETE
AppRoutes.prototype.routeDeleteEvent = function(requst, res) {
  var body = requst.body;
  var id = parseInt(body.playerID);
  this.db.deletePlayer(id, function(success) {
    if(success) res.json({status: "Success: deleted player", playerID: id});
    else sendNoUserError(id, res);
  });

};

module.exports = AppRoutes;
