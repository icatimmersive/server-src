"use strict";
/**
 * This will encapsulate the functionality of mapping blobs to global coordinates
 * In addition we will read in the csv file from a specific file so we can modify it easily
 * There will need to be some way to signal doing a new read on the file
 */

var method = GlobalTable.prototype;

function GlobalTable(csvFileName) {
    this.csvName = csvFileName;
    this.GlobalCoordinateTable = {};
    this.reloadCSV();
}

method.reloadCSV = function () {
    var fs = require('fs');
    var csv = require('csv');
    var setTable = function (err, data) {
        console.log('reloading table');
        convertToMeters(data);
        GlobalTable.GlobalCoordinateTable = data;
        console.log(GlobalTable.GlobalCoordinateTable)
    };
    var parser = csv.parse(
        {
            delimiter: ',',
            'columns': true,
            'objname': "cameraID",
            trim: true,
            auto_parse: true
        },
        setTable);
    fs.createReadStream(this.csvName).pipe(parser);
};

function convertToMeters(table) {
    for (var index in table) {
        if (table.hasOwnProperty(index)) {
            var attr = table[index];
            if (attr.theta == 'Math.PI') {
                attr.theta = Math.PI;
            }
            else {
                attr.theta = Number(attr.theta);
            }
            table[index] = toM(attr);
        }
    }
}

function makeCoordinateGlobal(data, table) {

    var origx = data.origin.x;
    var origy = data.origin.y;
    var origz = data.origin.z;
    var imageWidth = data.boundingBox.image_width;
    var imageHeight = data.boundingBox.image_height;
    var cameraId = data.cameraID;

    var area = getRect(cameraId, table);
    if (area.hasOwnProperty('invalid')) {
        //we have a bad camera ID
        //console.log('Did not have cameraID in csv.' + cameraId);
        return data;
    }
    var xM = origx / imageWidth * area.width;
    var zM = origy / imageHeight * area.height;

    var sin = Math.sin(area.theta);
    var cos = -Math.cos(area.theta);

    var globalXM = xM * sin + zM * cos + area.x;
    var globalZM = xM * cos + -zM * sin + area.z;//negate zM here
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
    if (!table.hasOwnProperty(cameraId.toString())) {
       // console.log(table);
        return {'invalid': true};
    }
    return table[cameraId.toString()];
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

method.makeGlobal = function (blob) {
    if (blob.hasOwnProperty('makeGlobal')) {
        if (!blob['makeGlobal']) {
            console.log('blob with id: ' + blob.cameraID + ' requested to not be transformed');
            return blob;
        }
    }
    return makeCoordinateGlobal(blob, GlobalTable.GlobalCoordinateTable);
};

module.exports = GlobalTable;
