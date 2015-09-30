/**
 * Created by Eric on 9/29/2015.
 */
var LOG_FILE_NAME = 'blobLog.txt';
var requestInterval = 1000; //miliseconds

var blobList = [];
var socket = require('socket.io-client')('http://dev.mirrorworlds.icat.vt.edu:8888');
socket.on('connect', function () {
    console.log('connected to server!');
});
socket.on('error', function (err) {
    console.log('an error occurred on the socket: ' + err);
});
var rl = require('readline').createInterface({
    input: require('fs').createReadStream(LOG_FILE_NAME)
});

rl.on('line', function (line) {
    var tokens = line.split('\t');
    if (tokens.length == 2) {
        var timeStamp = new Date(tokens[0]);
        var blob = JSON.parse(tokens[1]);
        blobList.push(blob);
    }
});
rl.on('close', function () {
    console.log('We have ' + blobList.length + ' blobs read');
    sendData();
});

function sendData() {
    if (blobList.length != 0) {
        var blob = blobList.pop();
        if (blob.age == "NEW") {
            socket.emit('new', blob);
        }
        else if (blob.age == "OLD") {
            socket.emit('update', blob);
        }
        else if (blob.age == "LOST") {
            socket.emit('remove', blob);
        }
        else {
            console.log("Invalid blob age on blob so not sending")
        }
        //make this be called again on the next interval
        setTimeout(sendData, requestInterval);
    }
    else {

        console.log('We have completed our task');
        socket.disconnect();
        process.exit();
    }
}