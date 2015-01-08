//-----------------------------------------------------------------------------
// Utilities for handling score collections in server active memory
//-----------------------------------------------------------------------------

function makePlayerBlob(id, name) {
  // Intrinsic list iterator included
  return {id: id, playerName: name, score:0, next:null, prev:null};
}

// A doubly linked list for storing player scores.
// * The DLL is implemented in the event that we need to remove a user quickly.
// * Head is the highest score.
var SortedList = function() {
  this.head = {}; // Head is the highest element
};

SortedList.prototype.remove = function(playerBlob) {
  if(playerBlob.next && playerBlob.next.prev) {
    playerBlob.next.prev = playerBlob.prev;
  }
  if(playerBlob.prev && playerBlob.prev.next) {
    playerBlob.prev.next = playerBlob.next;
  }

  if(this.head == playerBlob) this.head = playerBlob.next;
};

SortedList.prototype.addOrUpdate = function(playerBlob) {
  // Is already in the list, unlink it
  this.remove(playerBlob);

  var node = this.head,
  score = playerBlob.score;

  while(node) {
    //console.log(node);
    if(!node.score || score >= node.score) {
      playerBlob.next = node;
      playerBlob.prev = node.prev;
      node.prev = playerBlob;
      if(node==this.head) this.head = playerBlob;
      break;
    }
    node = node.next;
  }
  return playerBlob;
};

SortedList.prototype.getScores = function (start, end) {
  var list=[];
  var i = 0;
  var node = this.head;
  while(node.score && i <= end)  {
    if(i >= start) {
      // Format the result for the json response, hides the linked nature of the data
      list.push({playerID: node.id, playerName: ""+node.playerName, score: node.score});
    }
    i++;
    node = node.next;
  }
  return list;
};

//-----------------------------------------------------------------------------
// Wrapper for handling score data inserting and querying
//-----------------------------------------------------------------------------

var ScoreDB = function() {
  // Game state
  this.players = {};
  this.scores = new SortedList();
  this.uniqueID = 0;
};

// Wrapper to connect to a DB, if this server needed to connect to one.
ScoreDB.prototype.connect = function () {
  return true;
};

// Save the user's score
ScoreDB.prototype.saveScore = function (playerID, score) {
  var node = this.players[playerID] ;
  node.score = score;
  this.scores.addOrUpdate(node);
};

// Get a range of scores
ScoreDB.prototype.getScores = function (start, end) {
  return this.scores.getScores(start,end);
};

// Register a new player
ScoreDB.prototype.registerPlayer = function (name) {
  var id = this.uniqueID;
  var player = this.players[id] = makePlayerBlob(id, name);
  this.saveScore(id, 0);
  this.uniqueID++;
  return player;
};

// Delete a player
ScoreDB.prototype.deletePlayer = function (playerID) {
  if( !this.players[playerID] ) return false;

  this.scores.remove( this.players[playerID]  );
  delete this.players[playerID];
  return true;
};

// Check if the player exists
ScoreDB.prototype.hasPlayer = function (playerID) {
  return this.players[playerID]!==undefined;
};

// Get a score that's specific to a user. Does not need to traverse the linked list.
ScoreDB.prototype.getScore = function (playerID) {
  // If the user doens't have a saved score yet, return 0
  return this.players[playerID]===undefined ? 0 : this.players[playerID].score;
};

module.exports = new ScoreDB();
