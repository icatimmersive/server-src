/**
 * Created by Eric on 10/7/2015.
 */
/**
 * This File will hold a process that will manage all the blobs send to the server.
 * It will then notify the server of what blobs it needs to send
 */

var method = BlobManager.prototype;

function BlobManager(sendBlobCallback) {
    this._blobCallback = sendBlobCallback;
    this.cameraTable = {};
}

method.placeInTable = function (blob) {
    var thisCID = blob.cameraID;
    if (!(thisCID in this.cameraTable)) {
        this.cameraTable[thisCID] = {};
    }
    this.cameraTable[thisCID][blob.id] = blob;
};

method.removeFromTable = function (blob) {
    try {
        delete(this.cameraTable[blob.cameraID][blob.id])
    }
    catch (err) {
        console.log("Could Not remove blob: " + err);
    }
};

method.getAllBlobs = function () {
    var allBlobList = [];
    for (var idList in this.cameraTable) {
        if (this.cameraTable.hasOwnProperty(idList)) {
            var idObj = this.cameraTable[idList];
            for (var blob in idObj) {
                if (idObj.hasOwnProperty(blob)) {
                    allBlobList.push(idObj[blob]);

                }
            }
        }
    }
    return allBlobList;
};


method.processRemove = function (blob) {
    //just send back the blob
    this._blobCallback(blob);
};

method.processAdd = function (blob) {
    //just send it right now
    this._blobCallback(blob);
};
method.processBlob = function (blob) {
    if (blob.age == "LOST") {
        this.removeFromTable(blob);
        this.processRemove(blob);
    }
    else {
        this.placeInTable(blob);// now the blob is in the table
        this.processAdd(blob);
    }
};

module.exports = BlobManager;