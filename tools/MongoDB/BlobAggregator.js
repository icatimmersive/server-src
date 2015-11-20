/**
 * Created by Eric on 10/30/2015.
 */

//This tool attempts to connect to a mongoDB instance
//and insert the blobs that are sent from the server

process.stdin.resume();
process.stdin.setEncoding('utf8');
var help = 'This script will open a connection to a mongoDB server on localhost and stream all blobs to mongoDB\n' +
    'The Usage is :\n' +
    'node blobAggregator.js <database suffix to use>';
var util = require('util');
console.log('please start mongoDB, press enter once done or -help for more info');
var specificDB = '';
if (process.argv.length == 3) {
    specificDB = process.argv[2];
}
process.stdin.on('data', function (text) {
    text = text.toString().trim();
    if (text == '-help') {
        console.log(help);
    }
    else if (text == '') {
        process.stdin.end();
        var MongoClient = require('mongodb').MongoClient;
        var assert = require('assert');
        var url = 'mongodb://localhost:27017/production' + specificDB;
        console.log('attempting to connect to mongoDB with url: ', url);
        MongoClient.connect(url, function (err, db) {
            assert.equal(null, err);
            console.log("Connected correctly to MongoDB.");
            var socket = require('socket.io-client')('http://dev.mirrorworlds.icat.vt.edu:8888');
            socket.emit('start', {connectionType: 'LISTENER'});

            socket.on('connect', function () {
                console.log('connected to server!');
            });

            socket.on('error', function (err) {
                console.log('an error occurred on the socket: ' + err);
            });

            socket.on('newBlob', function (blob) {
                db.collection('newBlobs').insertOne({timestamp: new Date(), blob: blob});
                console.log('newblob');
            });

            socket.on('updateBlob', function (blob) {
                db.collection('updateBlobs').insertOne({timestamp: new Date(), blob: blob});
                //console.log('updateBlob');
                //logging update blobs will spit out too much to the console to be readable
            });

            socket.on('removeBlob', function (blob) {
                db.collection('removeBlobs').insertOne({timestamp: new Date(), blob: blob});
                console.log('removedBlob');
            });

        });
    }
    else {
        console.log('unrecognised input: ', text);
    }
});




