#! /bin/bash
# Requires HTTPie: https://github.com/jakubroztocil/httpie

http POST localhost:3000 name:bob event:=1
http POST localhost:3000 name:don event:=1

http POST localhost:3000 playerID="0" score:=10 event:=2
http POST localhost:3000 playerID="1" score:=20 event:=2

http POST localhost:3000 event:=3 range:=[0,1]

http POST localhost:3000 playerID="0" score:=30 event:=2

http POST localhost:3000 event:=3 range:=[0,1]

http POST localhost:3000 playerID="0" event:=4

http DELETE localhost:3000 playerID="0"

http POST localhost:3000 event:=3 range:=[0,1]
