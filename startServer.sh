#!/usr/bin/env bash
export PATH="./node_modules/.bin:$PATH";
#Starts the server with forever so that we can have it restart
echo "Starting the Server with forever.js";
type forever >/dev/null 2>&1 || { echo "I require forever but it's not installed.  Attempting to install it ."; sudo npm install -g forever; }
forever start server.js;
echo "If this failed make sure to install forever and have it in your path"
echo "npm install -g forever";
