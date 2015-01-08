//var db = require('./scoredb.js');

//-----------------------------------------------------------------------------
// Routing handlers for the leaderboard
// Created by: Jonathan Dunlap
//-----------------------------------------------------------------------------

var AppRoutes = function(db) {
  this.db = db;
};

AppRoutes.prototype.sendNoUserError = function(id, res) {
  res.status(500).json({status: "Error: user id does not exist", playerID: id});
};

AppRoutes.prototype.registerPlayer = function(body, res) {
  var name = body.name;
  var playerID = this.db.registerPlayer(name, function(id) {
    res.json({status: "Success: registered user", playerID: id, name: name});
  });
};

AppRoutes.prototype.setScore = function(body, res) {
  var id = parseInt(body.playerID);
  var score = parseInt(body.score); // parse just in case score wasn't an int
  this.db.saveScore(id, score);
  res.json({status: "Success: setting score", playerID: id, score: score});
};

AppRoutes.prototype.getScoreRange = function (body, res) {
  var start = body.range[0];
  var end = body.range[1];
  this.db.getScores(start,end, function(scores) {
    res.json({scores:scores});
  });
};

AppRoutes.prototype.getScoreByPlayerID = function (body, res) {
  var id = parseInt(body.playerID);
  this.db.getScore(id, function(score) {
    res.json({status: "Success: recalled score", playerID: id, score: score});
  });
};

AppRoutes.prototype.eventRoutes = function() {
  // Ensure handlers are bound to this scope
  return [
      this.registerPlayer.bind(this),
      this.setScore.bind(this),
      this.getScoreRange.bind(this),
      this.getScoreByPlayerID.bind(this)
      ];
};

AppRoutes.prototype.routePostEvent = function(requst, res) {
  var body = requst.body;
  var eventHandlers = this.eventRoutes();
  var event = body.event === undefined?1:parseInt(body.event);
  event -= 1; // Index needs to start at 0
  if(event >= 0 && event < eventHandlers.length) {
    eventHandlers[event](body, res);
  } else {
    res.json({status: "Invalid event ID!"});
  }
};

AppRoutes.prototype.routeDeleteEvent = function(requst, res) {
  var body = requst.body;
  var id = parseInt(body.playerID);
  this.db.deletePlayer(id);
  res.json({status: "Success: deleted player", playerID: id});
};

module.exports = AppRoutes;
