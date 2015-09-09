/**
 * Created by Eric Williamson on 9/8/2015.
 */

/**
 * This file exists to test the TCP connection establishment to the server demoServer.js
 */
var sampleNewData = {
    "age": "NEW",
    "connectionType": "DATASOURCE",
    "id": "0",
    "origin": {
        "x": 1.0,
        "y": 2.0,
        "z": 0.0
    },
    "orientation": {
        "x": 0,
        "y": 0,
        "z": 0,
        "theta": 0
    },
    "source": "MATLAB",
    "updateTime": 0,
    "creationTime": 0,
    "boundingBox": {
        "x": 1.0,
        "y": 2.0,
        "width": 5,
        "height": 5
    }
};

var assert = require('chai').assert; //using the chai libraries for all of the assert/expect/should
var server = require("../demoServer");
var net = require('net');
var matlabSender;
var client = require('socket.io-client')('http://localhost:8888');
client.on('connect', function () {
    client.emit('start', {connectionType: "LISTENER", id: "listenerClient"});
});


//turn off the server from talking and spamming the test console
console.log = function () {
};

/**
 * This is to be used when JSON.stringify reports circular references
 * It strips all object and function references
 * @param object to stringify
 */
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
        assert.ok(true, 'we have not received any data to the client ' + clientString + ' which was wht was wanted');
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
    matlabSender.write(JSON.stringify(blobData));
};
assertDidReceive = function (client, blobData, done) {
    var timeout = setTimeout(function () {
        assert.ok(false, 'we have not received in the client, even though we sent valid data');
        done()
    }, 800);
    client.on('newBlob', function (blob) {
        assert.ok(true, 'we should receive a response back to our client');
        assert.equal(JSON.stringify(blob), JSON.stringify(blobData), 'We should receive the same blob we sent');
        clearTimeout(timeout);
        done();
    });
    client.on('updateBlob', function (blob) {
        assert.ok(true, 'we should receive a response back to our client');
        assert.equal(JSON.stringify(blob), JSON.stringify(blobData), 'We should receive the same blob we sent');
        clearTimeout(timeout);
        done();
    });
    matlabSender.write(JSON.stringify(blobData));
};


describe('TCPServer', function () {
    beforeEach(function (done) {
        matlabSender = net.connect({port: 9999}, function () {
            assert.isTrue(true, "We have successfully connected to the Server");
            done()
        });
        client.removeAllListeners();
        client.on('connect', function () {
            client.emit('start', {connectionType: "LISTENER", id: "listenerClient"});
        });
    });

    describe('sendingNewBlobs', function () {
        beforeEach(function () {
            matlabSender.on('data', function () {
                    assert.ok(false, 'We should not have received a response back to MATLAB');
                }
            );
        });
        afterEach(function (done) {
            matlabSender.end(function () {
                done()
            });
        });
        it('should have connected and can now try to send a valid connection by sending a connect phrase', function (done) {
            assertDidReceive(client, sampleNewData, done);
        });

        it('should not get any response when we send an invalid blob', function (done) {
            var invalidBlob = {invalid: "true"};
            assertNoReceive(client, invalidBlob, done);

        });
    });
    describe("Sending UpdateBlobs", function () {
        var connectionType = "DATASOURCE";
        var id = "0";
        var origin = {x: 1.0, y: 2.0, z: 3.0};
        var orientation = {x: 0.0, y: 0.0, z: 0.0, theta: 0.0};
        var source = "matLabClientTestSuite";
        var updatedTime = "now";
        var creationTime = "recently";
        var boundingBox = {x: 0.0, y: 0.0, width: 10.0, height: 10.0};
        var updateData = {
            connectionType: connectionType,
            updateType: "update",
            id: id,
            origin: origin,
            orientation: orientation,
            source: source,
            updatedTime: updatedTime,
            creationTime: creationTime,
            boundingBox: boundingBox,
            age: "OLD"
        };


        describe("Valid UpdateBlob", function () {
            it("should return an updated blob to the receiver", function (done) {
                assertDidReceive(client, updateData, done);
            });

            it("should not send anything back along to the matlab instance", function (done) {
                assertNoReceive(matlabSender, updateData, done);
            });
        });
        describe("Invalid UpdateBlob", function () {

        });
    });
    it('should connect to the server for each method', function (done) {
        assert.isOk(true, 'should never fail');
        done()
    })
});
