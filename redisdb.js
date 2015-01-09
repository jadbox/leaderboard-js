var redis = require('redis');
var TPLAYERS = "player:",
      TSCORES = "scores_list",
      UID = "uniqueID";
//-----------------------------------------------------------------------------
// Redis module to save/restore player and score state
//-----------------------------------------------------------------------------

var RedisDB = function() {

};

// Connect to redis
RedisDB.prototype.connect = function () {
  this.client = redis.createClient();
};

// Save the user's score
RedisDB.prototype.saveScore = function (playerID, score, onComplete) {
  var client = this.client;
  client.exists(TPLAYERS+playerID, function(err, existed) {
    if(!existed) {
        onComplete(false);
        return;
    }
    client.zadd([TSCORES, score, playerID], function(err,msg) {
      onComplete(true);
    });
  });
};

// Get a range of scores
// start begins at the highest score
// end moves backwards to lower scores
RedisDB.prototype.getScores = function (start, end, onData) {
  var scores = [];
  // Get range of scores using the sorted Redis list
  this.client.zrevrange(TSCORES, start, end, 'withscores', function(err, members) { //'withscores',
    while(members.length > 0) {
      var id = members.shift();
      var score = members.shift();
      if(id!="null") scores.push({playerID:id, score:score});
    }
    //console.log(scores);
    onData(scores);
  });
  return scores;
};

// Register a new player name and return a new unique ID
RedisDB.prototype.registerPlayer = function (name, onID) {
  //var client = this.client;
  this.client.incr(UID, function(err, id) {
    this.client.hmset(TPLAYERS+id, {name:name}, redis.print);
    this.saveScore(id, 0, function(onComplete) {
      onID(id);
    });
  }.bind(this));

};

// Delete a player
// Callback returns true if player was found and delete, false if player did not exist
RedisDB.prototype.deletePlayer = function (playerID, onComplete) {
  this.client.exists(TPLAYERS+playerID, function(err, exists) {
    if(!exists) onComplete(false);
    else {
      this.client.zrem(TSCORES, playerID); // Remove from the sorted score table
      this.client.del(TPLAYERS+playerID); // Remove from the player tables
      onComplete(true);
    }
  }.bind(this));
};

// Get a score that's specific to a user. Does not need to traverse the linked list.
RedisDB.prototype.getScore = function (playerID, onScore) {
  this.client.zscore(TSCORES, playerID, function(err, score) {
    onScore(score);
  });
};

module.exports = new RedisDB();
