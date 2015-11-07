"use strict";
/**
 * Created by Eric on 10/7/2015.
 */
/**
 * This File will hold a process that will manage all the blobs send to the server.
 * It will then notify the server of what blobs it needs to send
 */

var method = BlobManager.prototype;


function BlobManager(sendBlobCallback) {
    this.callback = sendBlobCallback;

}
function placeInTable(blob, cameraTable) {
    var thisCID = blob.cameraID;
    if (!(thisCID in cameraTable)) {
        cameraTable[thisCID] = {};
    }
    cameraTable[thisCID][blob.id] = blob;
}

function removeFromTable(blob, cameraTable) {
    try {
        if (!delete(cameraTable[blob.cameraID][blob.id])) {
            console.log('failed deleting blob: ' + JSON.stringify(blob));
        }
    }
    catch (err) {
        console.log("Could Not remove blob: " + err);
    }
}


function processRemove(blob, callback) {
    callback(blob);
}


function processUpdate(blob, callback) {
    callback(blob);
}

function processAdd(blob, callback) {
    callback(blob);
}

function makeCoordGlobal(blob) {
    //this is where you can implement your logic
    return blob;
}
method.processBlob = function (blob) {
    blob = makeCoordGlobal(blob);
    if (blob.age == "LOST") {
        processRemove(blob, this.callback);
    }
    else if (blob.age == "OLD") {
        processUpdate(blob, this.callback);
    }
    else {
        processAdd(blob, this.callback)
    }
};

module.exports = BlobManager;