/**
 * This file serves as an example for how to listen to the server using the socket.io api
 * from their node-js library.
 */
// Need the Socket.io client library from npm listed in the package.json
var socket = require('socket.io-client')('http://localhost:8888'); // to connect to the live server the address is dev.mirrorworlds.icat.vt.edu
socket.emit('start', {connectionType: 'LISTENER'}); //We are telling the server we will listen for all blobs
/*
 If we wanted to listen for specific camera ids we need to populate a reqCameras field with an array of ids
 Example:
 socket.emit('start', {connectionType: 'LISTENER', reqCameras: [0,1,2]}); //will subscript to cameras 0,1,and 2
 */
/*
 you can also only receive the blobs without the global transformation by adding the local: true field to your spec
 */

/**
 * This will inform the user when the connection to the server occurs to help diagnose between
 * being unable to connect and not recieveing the blobs form the server for some reason
 */
socket.on('connect', function () {
    console.log('connected to server!');
});

/**
 * This will alert the user when a network/socket error is encountered and give a detailed error message
 * so that the issue can be addressed
 */
socket.on('error', function (err) {
    console.log('an error occurred on the socket: ' + err);
});

/**
 * Listen for new blobs and log when they are received
 * The newBlob event will be emitted by the server when a blob has been created.
 */
socket.on('newBlob', function (blob) {
    console.log('newblob was received with data: ' + JSON.stringify(blob));
});
/**
 * Listen for update blobs. Logging update blobs is turned off by default as update blobs can come in a steady stream
 * so logging them would clutter stdout and lead to a more confusing example.
 * an updateBlob event will be sent when an existing blobs has updated coordinates to notify of those changes.
 */
socket.on('updateBlob', function (blob) {
    //console.log('updateBlob' + JSON.stringify(blob));
    //logging update blobs may spit out too much to the console to be readable so it is commented out for now
});
/**
 * Listen for remove blobs and log when they are received.
 * The removeBlob event will be sent when an existing blob is not longer in the world and should be removed.
 */
socket.on('removeBlob', function (blob) {
    console.log('removedBlob was received with data: ' + JSON.stringify(blob));
});
