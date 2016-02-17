/**
 * This file will generate random blobs so that they can be used to send unique data to the server
 *
 * The only method is a nextBlob method that will give this random blob
 */

var method = BlobGen.prototype;

function BlobGen() {

}

/**
 * Returns a random number between min (inclusive) and max (exclusive)
 */
function getRandomArbitrary(min, max) {
    return Math.random() * (max - min) + min;
}

/**
 * Returns a random integer between min (inclusive) and max (inclusive)
 * Using Math.round() will give you a non-uniform distribution!
 */
function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getRandomAge() {
    switch (getRandomInt(0, 2)) {
        case 1:
            return "OLD";
        case 2:
            return "NEW";
        default:
            return "LOST";
    }
}

method.nextBlob = function () {
    return {
        id: getRandomInt(0, 30),
        cameraID: getRandomInt(20, 30),
        origin: {
            x: getRandomArbitrary(0, 5),
            y: getRandomArbitrary(0, 5),
            z: getRandomArbitrary(0, 5)
        },
        orientation: {
            x: getRandomArbitrary(0, 5),
            y: getRandomArbitrary(0, 5),
            z: getRandomArbitrary(0, 5),
            theta: getRandomArbitrary(0, Math.PI)
        },
        source: "blob_gen",
        updatedTime: new Date().getTime(),
        creationTime: new Date().getTime(),
        boundingBox: {
            x: getRandomArbitrary(0, 5),
            y: getRandomArbitrary(0, 5),
            imageWidth: getRandomArbitrary(1, 300),
            imageHeight: getRandomArbitrary(1, 300),
            width: getRandomArbitrary(1, 5),
            height: getRandomArbitrary(1, 5)
        },
        age: getRandomAge(),
        connectionType: "DATASOURCE"
    };

};
module.exports = BlobGen;