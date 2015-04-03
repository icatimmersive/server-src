var socket = require('socket.io-client')('http://dev.mirrorworlds.icat.vt.edu:8888');

process.stdin.setEncoding('utf8');

var blob = {id: 1, 
        origin: {x: -2.75, y: -2.77, z: 1},
        orientation: {x: 0, y: 0, z: 0, theta: 0},
        boundingBox: {x: 0, y: 0, width: 0, height: 0},
        source: "0",
        updatedTime: "0",
        creationTime: "0",
        connectionType: "DATASOURCE"
        };

var blob2 = {id: 2, 
        origin: {x: -3.75, y: -2.77, z: 2},
        orientation: {x: 0, y: 0, z: 0, theta: 0},
        boundingBox: {x: 0, y: 0, width: 0, height: 0},
        source: "0",
        updatedTime: "0",
        creationTime: "0",
        connectionType: "DATASOURCE"
        };

socket.on('connect', function(){
    socket.emit('start', {connectionType: "DATASOURCE"});
  socket.emit('new', blob);
  socket.emit('new', blob2);
    
  setInterval(function() {
    blob.origin.z += .04;
    socket.emit('update', blob);
  }, 60);
  
    setInterval(function() {
    blob2.origin.z += .02;
    socket.emit('update', blob2);
  }, 60);
});
