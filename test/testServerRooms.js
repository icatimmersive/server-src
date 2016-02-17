/**
 * Created by Eric on 2/12/2016.
 */
/**
 * This will test subscription to the sever based on cameraIDs.
 *
 * We will both test subscription based on cameras and subscription based for every blob.
 */

var assert = require('chai').assert; //using the chai libraries for all of the assert/expect/should
var server = require("../server");

var glob_client = require('socket.io-client')('http://localhost:8888');
var sub_client = require('socket.io-client')('http://localhost:8888');
var sampleData = {
    "age": "NEW",
    "connectionType": "DATASOURCE",
    "id": "0",
    "origin": {
        "x": 0.0,
        "y": 0.0,
        "z": 0.0
    },
    "orientation": {
        "x": 0,
        "y": 0,
        "z": 0,
        "theta": 0
    },
    "source": "",
    "updateTime": 0,
    "creationTime": 0,
    "boundingBox": {
        "x": 1.0,
        "y": 2.0,
        "width": 5,
        "height": 5
    },
    cameraID: 1
};
simpleStringify = function (object) {
    var simpleObject = {};
    for (var prop in object) {
        if (!object.hasOwnProperty(prop)) {
            continue;
        }
        if (typeof(object[prop]) == 'object') {
            continue;
        }
        if (typeof(object[prop]) == 'function') {
            continue;
        }
        simpleObject[prop] = object[prop];
    }
    return JSON.stringify(simpleObject);
};

assertNoReceive = function (client, blobData, done) {
    var clientString = simpleStringify(client);
    var timeout = setTimeout(function () {
        assert.ok(true, 'we have not received any data to the client ' + clientString + ' which was what was wanted');
        done()
    }, 300);
    client.on('newBlob', function (blob) {
        assert.ok(false, 'we should not receive a response to the client ' + clientString + '. We received:   ' + JSON.stringify(blob));
        clearTimeout(timeout);
        done()
    });
    client.on('updateBlob', function (blob) {
        assert.ok(false, 'we should not receive a response to the client ' + clientString + '. We received:   ' + JSON.stringify(blob));
        clearTimeout(timeout);
        done()
    });
    client.on('removeBlob', function (blob) {
        assert.ok(false, 'we should not receive a response to the client ' + clientString + '. We received:   ' + JSON.stringify(blob));
        clearTimeout(timeout);
        done()
    });
};
assertReceive = function (client, blobData, eventType, done) {
    client.on(eventType, function (blob) {
        console.log(blob);
        assert.ok(true, 'we should receive a response back to our client');
        assert.equal(JSON.stringify(blob), JSON.stringify(blobData), 'We should receive the same blob we sent');
        done()
    });
};

describe("Server Rooms", function () {
    beforeEach(function (done) {
        glob_client.removeAllListeners();
        sub_client.removeAllListeners();
        glob_client = require('socket.io-client').connect('http://localhost:8888', {
            transports: ['websocket'],
            'force new connection': true
        });
        sub_client = require('socket.io-client').connect('http://localhost:8888', {
            transports: ['websocket'],
            'force new connection': true
        });
        var count = 0;

        glob_client.on('connect', function () {
            count = count + 1;
            glob_client.emit('start', {connectionType: "LISTENER", id: "listenerClient"});
            if (count >= 2) {
                done()
            }
        });

        sub_client.on('connect', function () {
            count = count + 1;
            sub_client.emit('start', {connectionType: "LISTENER", id: "listenerClient", reqCameras: [25, 26, 27]});
            if (count >= 2) {
                done();
            }
        });
    });
    afterEach(function (done) {
        glob_client.disconnect();
        sub_client.disconnect();
        sampleData.age = 'NEW';
        done();
    });

    describe('Sending blobs with sub_client camera IDs', function () {
        it("should recieve one with camera id 25", function (done) {
            sampleData.source = "Sending blobs with sub client camera IDs";
            sampleData.cameraID = 25;
            var count = 0;
            Two_Done = function () {
                count = count + 1;
                if (count >= 2) {
                    done()
                }
            };
            assertReceive(glob_client, sampleData, 'newBlob', Two_Done);
            assertReceive(sub_client, sampleData, 'newBlob', Two_Done);
            glob_client.emit('new', sampleData);
        });
        it("should also be able to receive an update blob", function () {
            sampleData.source = "Sending blobs with sub client camera IDs";
            sampleData.cameraID = 25;
            sampleData.age = "OLD";
            var count = 0;
            Two_Done = function () {
                count = count + 1;
                if (count >= 2) {
                    done()
                }
            };
            assertReceive(glob_client, sampleData, 'updateBlob', Two_Done);
            assertReceive(sub_client, sampleData, 'updateBlob', Two_Done);
            glob_client.emit('update', sampleData);
        });
        it("should also be able to receive a remove blob", function () {
            sampleData.source = "Sending blobs with sub client camera IDs";
            sampleData.cameraID = 25;
            sampleData.age = "LOST";
            var count = 0;
            Two_Done = function () {
                count = count + 1;
                if (count >= 2) {
                    done()
                }
            };
            assertReceive(glob_client, sampleData, 'removeBlob', Two_Done);
            assertReceive(sub_client, sampleData, 'removeBlob', Two_Done);
            glob_client.emit('remove', sampleData);
        });
        it("should receive one with camera id 26", function (done) {
            sampleData.source = "Sending blobs with sub client camera IDs";
            sampleData.cameraID = 26;
            var count = 0;
            Two_Done = function () {
                count = count + 1;
                if (count >= 2) {
                    done()
                }
            };
            assertReceive(glob_client, sampleData, 'newBlob', Two_Done);
            assertReceive(sub_client, sampleData, 'newBlob', Two_Done);
            glob_client.emit('new', sampleData);
        });
        it("should recieve one with camera id 27", function (done) {
            sampleData.source = "Sending blobs with sub client camera IDs 27";
            sampleData.cameraID = 27;
            var count = 0;
            Two_Done = function () {
                count = count + 1;
                if (count >= 2) {
                    done()
                }
            };
            assertReceive(glob_client, sampleData, 'newBlob', Two_Done);
            assertReceive(sub_client, sampleData, 'newBlob', Two_Done);
            glob_client.emit('new', sampleData);
        })
    });
    describe("sending blobs that sub_client should not see", function () {
        it("should not receive a new blob with id 28", function (done) {
            sampleData.source = "Sending blobs should be to global only camera IDs 28";
            sampleData.cameraID = 28;
            var count = 0;
            Two_Done = function () {
                count = count + 1;
                if (count >= 2) {
                    done()
                }
            };
            assertReceive(glob_client, sampleData, 'newBlob', Two_Done);
            assertNoReceive(sub_client, sampleData, Two_Done);
            glob_client.emit('new', sampleData);
        });
        it("should not receive an update blob with id 28 to sub_client", function (done) {
            sampleData.source = "Sending blobs should be to global only camera IDs 28";
            sampleData.cameraID = 28;
            sampleData.age = "OLD";
            var count = 0;
            Two_Done = function () {
                count = count + 1;
                if (count >= 2) {
                    done()
                }
            };
            assertReceive(glob_client, sampleData, 'updateBlob', Two_Done);
            assertNoReceive(sub_client, sampleData, Two_Done);
            glob_client.emit('update', sampleData);
        });
        it("should not receive an update blob with id 28 to sub_client", function (done) {
            sampleData.source = "Sending blobs should be to global only camera IDs 28";
            sampleData.cameraID = 28;
            sampleData.age = "LOST";
            var count = 0;
            Two_Done = function () {
                count = count + 1;
                if (count >= 2) {
                    done()
                }
            };
            assertReceive(glob_client, sampleData, 'removeBlob', Two_Done);
            assertNoReceive(sub_client, sampleData, Two_Done);
            glob_client.emit('remove', sampleData);
        })
    })

});