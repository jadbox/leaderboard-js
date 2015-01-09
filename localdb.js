//---------------------------------------------------------------------------------
// Utilities for handling score collections in server active memory
//---------------------------------------------------------------------------------

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
  this.idFreeList = []; // reuse deleted IDs to condense range
};

// Get a unqiue ID for player, may reuse from past deleted players
LocalDB.prototype.getID = function () {
  if(this.idFreeList.length > 0) return this.idFreeList.shift();
  var id = this.uniqueID;
  this.uniqueID++;
  return id; // post op increment
};

// Wrapper to connect to a DB, not needed here since it's server-local
LocalDB.prototype.connect = function () {
  return true;
};

// Save the user's score
// onComplete returns true on success, false if the user doesn't exist
LocalDB.prototype.saveScore = function (playerID, score, onComplete) {
  var node = this.players[playerID] ;
  if(!node) {
    onComplete(false);
    return;
  }
  node.score = score;
  this.scores.addOrUpdate(node);
  onComplete(true);
};

// Get a range of scores.
// Function is async (by interface) to support DB clients.
LocalDB.prototype.getScores = function (start, end, onData) {
  var scores = this.scores.getScores(start,end);
  onData(scores);
};

// Register a new player
LocalDB.prototype.registerPlayer = function (name, onID) {
  var id = this.getID();
  var player = this.players[id] = makePlayerBlob(id, name);
  this.saveScore(id, 0, function(onComplete) {
    onID(id);
  });
};

// Delete a player
// Callback onComplete returns true if player was found and deleted.
LocalDB.prototype.deletePlayer = function (playerID, onComplete) {
  if( !this.players[playerID] ) {
    onComplete(false);
    return;
  }

  this.scores.remove( this.players[playerID]  );
  if( !this.players[playerID] ) {
    onComplete(false);
  } else {
    delete this.players[playerID];
    this.idFreeList.push(playerID);
    onComplete(true);
  }
};

// Get a score that's specific to a user. Does not need to traverse the linked list.
// Function is async (by interface) to support DB clients.
LocalDB.prototype.getScore = function (playerID, onData) {
  var score = this.players[playerID]===undefined ? null : this.players[playerID].score;
  onData(score);
};

module.exports = new LocalDB();
