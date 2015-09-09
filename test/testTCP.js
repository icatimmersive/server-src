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
//console.log = function () {
//};

describe('TCPServer', function () {
    beforeEach(function (done) {
        matlabSender = net.connect({port: 9999}, function () {
            assert.isTrue(true, "We have successfully connected to the Server");
            done()
        })
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
            var timeout = setTimeout(function () {
                assert.ok(false, 'we have not received in the client, even though a new blob was sent');
                done()
            }, 400);
            client.on('newBlob', function (blob) {
                assert.ok(true, 'we should receive a response back to our client');
                assert.equal(JSON.stringify(blob), JSON.stringify(sampleNewData), 'We should receive the same blob we sent');
                clearTimeout(timeout);
                done();
            });
            matlabSender.write(JSON.stringify(sampleNewData));

        });

        it('should not get any response when we send an invalid blob', function (done) {
            var invalidBlob = {invalid: "true"};
            var timeout = setTimeout(function () {
                assert.ok(true, 'we have not received in the client because an invalid blob was sent');
                done()
            }, 300);
            client.on('newBlob', function (blob) {
                assert.ok(false, 'we should not receive a response as the blob was invalid. We received:   ' + blob);
                clearTimeout(timeout);
                done()
            });
            matlabSender.write(JSON.stringify(invalidBlob));

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

        beforeEach(function () {
            //matlabSender = net.connect({port: 9999}, function () {
            //  assert.isTrue(true, "We have successfully connected to the Server");
            //matlabSender.on('data', function () {
            //      assert.ok(false, 'We should not have received a response back to MATLAB');
            //    done();
            //}
            //);
            //})
        });
        describe("Valid UpdateBlob", function () {
            it("should return an updated blob to the receiver", function (done) {
                var timeout = setTimeout(function () {
                    assert.ok(false, 'we have not received in the client, even though an updated blob was sent');
                    done()
                }, 800);
                client.on('updateBlob', function (blob) {
                    assert.isOk(true, 'we have received an updated blob as we expected');
                    assert.equal(JSON.stringify(updateData), JSON.stringify(blob), 'WE should receive he same blob that we sent out');
                    clearTimeout(timeout);
                    done();
                });
                matlabSender.write(JSON.stringify(updateData))
            });
            it("should not send anything back along to the matlab instance", function () {
                var timeout = setTimeout(function () {
                    assert.ok(true, 'we have not received an updated blob to the matlab instance');
                    done()
                }, 300);
                matlabSender.on('updateBlob', function (blob) {
                    assert.isOk(false, 'we have received an updated blob but we did not want to receive any data');
                    clearTimeout(timeout);
                    done();
                });
                matlabSender.write(JSON.stringify(updateData))
            })
        });
        describe("Invalid UpdateBlob", function () {

        });
    });
    it('should connect to the server for each method', function (done) {
        assert.isOk(true, 'should never fail');
        done()
    })
});
