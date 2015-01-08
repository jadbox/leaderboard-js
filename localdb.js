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

var LocalDB = function() {
  // Game state
  this.players = {};
  this.scores = new SortedList();
  this.uniqueID = 1;
};

// Wrapper to connect to a DB, not needed here since it's server-local
LocalDB.prototype.connect = function () {
  return true;
};

// Save the user's score
LocalDB.prototype.saveScore = function (playerID, score) {
  var node = this.players[playerID] ;
  node.score = score;
  this.scores.addOrUpdate(node);
};

// Get a range of scores.
// Function is async (by interface) to support DB clients.
LocalDB.prototype.getScores = function (start, end, onData) {
  var scores = this.scores.getScores(start,end);
  onData(scores);
};

// Register a new player
LocalDB.prototype.registerPlayer = function (name, onID) {
  var id = this.uniqueID;
  var player = this.players[id] = makePlayerBlob(id, name);
  this.saveScore(id, 0);
  this.uniqueID++;
  onID(id);
};

// Delete a player
LocalDB.prototype.deletePlayer = function (playerID) {
  if( !this.players[playerID] ) return false;

  this.scores.remove( this.players[playerID]  );
  delete this.players[playerID];
  return true;
};

// Get a score that's specific to a user. Does not need to traverse the linked list.
// Function is async (by interface) to support DB clients.
LocalDB.prototype.getScore = function (playerID, onData) {
  // If the user doens't have a saved score yet, return 0
  var score = this.players[playerID]===undefined ? 0 : this.players[playerID].score;
  onData(score);
};

module.exports = new LocalDB();
