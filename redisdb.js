var redis = require('redis');
var TPLAYERS = "player:",
      TSCORES = "scores_list",
      UID = "uniqueID";
//-----------------------------------------------------------------------------
// Wrapper for handling score data inserting and querying
//-----------------------------------------------------------------------------

var RedisDB = function() {

};

// Connect to redis
RedisDB.prototype.connect = function () {
  this.client = redis.createClient();
};

// Save the user's score
RedisDB.prototype.saveScore = function (playerID, score) {
  var client = this.client;

  client.zadd([TSCORES, score, playerID], function(err,msg) {

  });
};

// Get a range of scores
RedisDB.prototype.getScores = function (start, end, onData) {
  var scores = [];
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

// Register a new player
RedisDB.prototype.registerPlayer = function (name, onID) {
  var client = this.client;
  client.incr(UID); // Increment beforehand as a simple way to create the field if it doesn't exist
  this.client.get(UID, function(err, id) {
    client.hmset(TPLAYERS+id, {name:name}, redis.print);
    this.saveScore(id, 0);
    onID(id);
  }.bind(this));

};

// Delete a player
RedisDB.prototype.deletePlayer = function (playerID) {
  this.client.zrem(TSCORES, playerID); // Remove from the sorted score table
  this.client.del(TPLAYERS+playerID); // Remove from the player tables
  return true;
};

// Get a score that's specific to a user. Does not need to traverse the linked list.
RedisDB.prototype.getScore = function (playerID, onScore) {
  this.client.zscore(TSCORES, playerID, function(err, score) {
    onScore(score);
  });
};

module.exports = new RedisDB();
