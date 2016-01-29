/**
 * This file serves as an example for how to listen to the server using the socket.io api
 * from their node-js library.
 */
// Need the Socket.io client library from npm listed in the package.json
var socket = require('socket.io-client')('http://localhost');
socket.emit('start', {connectionType: 'LISTENER'}); //We are telling the server we will listen for blobs

socket.on('connect', function () {
    console.log('connected to server!');
});

socket.on('error', function (err) {
    console.log('an error occurred on the socket: ' + err);
});

socket.on('newBlob', function (blob) {
    console.log('newblob was received with data: ' + JSON.stringify(blob));
});

socket.on('updateBlob', function (blob) {
    //console.log('updateBlob');
    //logging update blobs may spit out too much to the console to be readable so it is commented out for now
});

socket.on('removeBlob', function (blob) {
    console.log('removedBlob was received with data: ' + JSON.stringify(blob));
});