#! /bin/bash
# Requires HTTPie

http POST localhost:3000 name:Jon event:=1
http POST localhost:3000 name:Don event:=1

http POST localhost:3000 playerID="0" score:=10 event:=2
http POST localhost:3000 playerID="1" score:=20 event:=2

http POST localhost:3000 event:=3 range:=[0,1]

http POST localhost:3000 playerID="0" score:=30 event:=2

http POST localhost:3000 event:=3 range:=[0,1]

http POST localhost:3000 playerID="0" event:=4

http DELETE localhost:3000 playerID="0"

http POST localhost:3000 event:=3 range:=[0,1]
