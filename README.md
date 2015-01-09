**Clone, get dependencies and run:**  
```
git clone git@github.com:jadbox/leaderboard-js.git  
cd leaderboard-js  
npm install  
node server.js  
```
  
**Select DB**  
See lines 8-9 in server.js
  
**Test case:**  
With [HTTPie](https://github.com/jakubroztocil/httpie), run the client test script: [./test.sh](https://github.com/jadbox/leaderboard-js/blob/master/test.sh)
  
**Notes:**  
* Registering a new user only requires a name, as a playerID will be generated.
  * Example: http POST localhost:3000 name=Don event:=1
  * Reponse: ```{
    "name": "Don", 
    "playerID": 1, 
    "status": "Success: registered player"
    }```
* Deleting users require the DELETE HTTP method.
  * Example: http DELETE localhost:3000 playerID="1" 
  * Reponse: ```{
    "playerID": 1, 
    "status": "Success: deleted player"
}```
* All event actions, aside from delete player, use the POST HTTP method.
* Server port is 3000 by default (test.sh uses this), but can be speficied using the first arg.
  * Example: node server.js 2000
  
_See project files for documentation._
