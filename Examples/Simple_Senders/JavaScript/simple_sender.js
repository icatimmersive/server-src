/**
 * This file serves as an example for how to send data to the server using the socket.io api
 * from their node-js library.
 */
// Need the Socket.io client library from npm listed in the package.json
var socket = require('socket.io-client')('http://localhost:9998'); // to connect to the live server the address is dev.mirrorworlds.icat.vt.edu
socket.emit('start', {connectionType: 'DATASOURCE'}); //We are telling the server we will be sending blobs
/* We could also subscribe as a TWOWAY with specific camera IDS if we wanted to also receive blobs */
/**
 * This will inform the user when the connection to the server occurs to help diagnose between
 * being unable to connect and not receiving sending blobs to the server
 */
socket.on('connect', function () {
    console.log('connected to server!');
    // once we are connected we can begin sending blobs
    // for this client we will send blobs every 5 seconds
    function callSendOnTimeout() {
        sendBlob();
        setTimeout(callSendOnTimeout, 5000)
    }

    callSendOnTimeout()

});

sendBlob = function () {
    // generate a random blob to send to the server
    // the blob sent will most likely be representative of an actual object so you will replace
    // generating a random blob with the call to get that blob.
    var blobGen = require("./blob_gen");
    var blob = (new blobGen()).nextBlob();
    var eventType = '';
    // this is a switch statement that determines which event type should be emitted
    // based on the age field
    switch (blob.age) {
        case "OLD":
            eventType = 'update';
            break;
        case"NEW":
            eventType = 'new';
            break;
        case "LOST":
            eventType = 'remove';
            break;
        default:
            console.log("Invalid age String ", blob.age)
    }
    //this is where the blob is sent to the server
    socket.emit(eventType, blob);
    console.log(JSON.stringify(blob));
};
