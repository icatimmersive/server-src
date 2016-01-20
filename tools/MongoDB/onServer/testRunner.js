/**
 * Created by Eric on 10/30/2015.
 */

//This tool attempts to connect to a mongoDB instance
//and insert the blobs that are sent from the server
var io = require('socket.io')(4444);
var util = require('util');
var globalDB = null;
var MongoClient = require('mongodb').MongoClient;
var assert = require('assert');
var socket = require('socket.io-client')('http://dev.mirrorworlds.icat.vt.edu:8888');
socket.emit('start', {connectionType: 'LISTENER'});
socket.on('connect', function () {
    console.log('connected to server!');
});

socket.on('error', function (err) {
    console.log('an error occurred on the socket: ' + err);
});

socket.on('newBlob', function (blob) {
    if (globalDB) {
        globalDB.collection('newBlobs').insertOne({timestamp: new Date(), blob: blob});
    }
    console.log('newblob');
});

socket.on('updateBlob', function (blob) {
    if (globalDB) {
        globalDB.collection('updateBlobs').insertOne({timestamp: new Date(), blob: blob});
    }
    //console.log('updateBlob');
    //logging update blobs will spit out too much to the console to be readable
});

socket.on('removeBlob', function (blob) {
    if (globalDB) {
        globalDB.collection('removeBlobs').insertOne({timestamp: new Date(), blob: blob});
    }
    console.log('removedBlob');
});


io.on('connection', function (webSocket) {
    webSocket.on("new", function (name) {
        if (globalDB) {
            globalDB.close();
            globalDB = null;
        }

        var url = 'mongodb://localhost:27017/production' + name;
        MongoClient.connect(url, function (err, db) {
            assert.equal(null, err);
            console.log("Connected correctly to MongoDB. with name:" + name);
            globalDB = db;
        });
    });

    webSocket.on("close", function () {
        if (globalDB) {
            globalDB.close();
            globalDB = null;
            console.log('closed the database')
        }
    });

    webSocket.once("disconnect", function () {
        if (globalDB) {
            globalDB.close();
            globalDB = null;

        }
    });
});



