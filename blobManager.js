/**
 * Created by Eric on 10/7/2015.
 */
/**
 * This File will hold a process that will manage all the blobs send to the server.
 * It will then notify the server of what blobs it needs to send
 */

var method = BlobManager.prototype;


function BlobManager(sendBlobCallback) {
    var Threads = require('webworker-threads');
    this.t = Threads.create();
    this.t.on('sendBlob', function (blob) {
        sendBlobCallback(JSON.parse(blob))
    });
    function evalCallbacks() {
        var cameraTable = {};
        thread.on('getAllBlobs', function () {
            var allBlobList = [];
            for (var idList in cameraTable) {
                if (cameraTable.hasOwnProperty(idList)) {
                    var idObj = cameraTable[idList];
                    for (var blob in idObj) {
                        if (idObj.hasOwnProperty(blob)) {
                            allBlobList.push(idObj[blob]);

                        }
                    }
                }
            }
            //emit event
            // return allBlobList;
            thread.emit('allBlobs', JSON.stringify(allBlobList));
        });
        function placeInTable(blob, cameraTable) {
            var thisCID = blob.cameraID;
            if (!(thisCID in cameraTable)) {
                cameraTable[thisCID] = {};
            }
            cameraTable[thisCID][blob.id] = blob;
        }

        function removeFromTable(blob, cameraTable) {
            try {
                delete(cameraTable[blob.cameraID][blob.id])
            }
            catch (err) {
                console.log("Could Not remove blob: " + err);
            }
        }

        function processRemove(blob, cameraTable) {
            removeFromTable(blob, cameraTable);
            thread.emit('sendBlob', JSON.stringify(blob));
        }

        function processAdd(blob, cameraTable) {
            placeInTable(blob, cameraTable);
            thread.emit('sendBlob', JSON.stringify(blob));
        }

        function processBlob(blob, cameraTable) {
            if (blob.age == "LOST") {
                processRemove(blob, cameraTable);
            }
            else {
                processAdd(blob, cameraTable);
            }
        }

        thread.on('process', function (blobStr) {
            var blob = JSON.parse(blobStr);
            processBlob(blob, cameraTable);
        });
    }

    this.t.eval(evalCallbacks);
    this.t.eval('evalCallbacks()');
}


method.getAllBlobs = function (callBack) {
    this.t.on('allBlobs', function (listStr) {
        callBack(JSON.parse(listStr));
    });
    this.t.emit('getAllBlobs');
};

method.processBlob = function (blob) {
    this.t.emit('process', JSON.stringify(blob));
};

module.exports = BlobManager;