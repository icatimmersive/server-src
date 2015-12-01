"use strict";
/**
 * Created by Eric on 10/7/2015.
 */
/**
 * This File will hold a process that will manage all the blobs send to the server.
 * It will then notify the server of what blobs it needs to send
 */

var method = BlobManager.prototype;
var GlobalCoordinateTable = {
            //observation room camera
        1: {x: 0.0, y: 0.0, z: -24.0, width: 24.0, height: 19.0, theta: Math.PI},

	     //learning lab 1st camera
        2: {x: 0.0, y: 0.0, z: 0.0, width: 24.0, height: 16.0, theta: 0.0},

	    //learning lab 2nd camera
        3: {x: -16.0, y: 0.0, z: 0.0, width: 24.0, height: 16.0, theta: 0.0},

	    //learning lab 3rd camera
        4: {x: -48.0, y: 0.0, z: -24.0, width: 24.0, height: 16.0, theta: Math.PI},

	    //learning lab 4th camera
        5: {x: -64.0, y: 0.0, z: -24.0, width: 24.0, height: 19.0, theta: Math.PI}
    }
    ;



function BlobManager(sendBlobCallback) {
    this.callback = sendBlobCallback;
    function convertToMeters(table) {
        for (var index in table) {
            if (table.hasOwnProperty(index)) {
                var attr = table[index];
                table[index] = toM(attr);
            }
        }
    }

    convertToMeters(GlobalCoordinateTable);
}

function makeCoordinateGlobal(data, table) {

    var origx = data.origin.x;
    var origy = data.origin.y;
    var origz = data.origin.z;
    var imageWidth = data.boundingBox.image_width;
    var imageHeight = data.boundingBox.image_height;
    var cameraId = data.cameraID;

    var area = getRect(cameraId, table);
    var xM = ((origx) * 1.0) / (imageWidth * area.width);
    var zM = (origy * 1.0) / (imageHeight * area.height);

    var sin = Math.sin(area.theta);
    var cos = -Math.cos(area.theta);

    var globalXM = xM * sin + zM * cos + area.x;
    var globalZM = xM * cos + zM * sin + area.z;
    var globalYM = area.y + .5;

    data.origin.x = globalXM;
    data.origin.y = globalYM;
    data.origin.z = globalZM;

    return data;
}

//Coordinate system definitions
//They are defined in ft for ease because blueprints are in ft
//convert to meters at end of function.
function getRect(cameraId, table) {
  //  console.log(cameraId);
    if (!table.hasOwnProperty(cameraId)) {
        return {x: 0.0, y: 0.0, z: 0.0, width: 0.0, height: 0.0, theta: 0.0};
    }
    return table[cameraId];
    //console.log(JSON.stringify(r));
    //r = toM(r);
}

var M_PER_FT = .3048;
function toM(rect) {
    rect.x *= M_PER_FT;
//    console.log(rect.x);
    rect.y *= M_PER_FT;
    rect.z *= M_PER_FT;
    //console.log(rect.z);
    rect.width *= M_PER_FT;
    rect.height *= M_PER_FT;
    return rect;
    //theta is same
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

method.processBlob = function (blob) {
    blob = makeCoordinateGlobal(blob, GlobalCoordinateTable);
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
