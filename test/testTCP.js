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
var client;


//turn off the server from talking and spamming the test console
console.log = function () {
};

describe('TCPServer', function () {
    beforeEach(function (done) {
        client = net.connect({port: 9999}, function () {
            assert.isTrue(true, "We have successfully connected to the Server");
            done()
        })
    });

    describe('serverConnect', function () {
        it('should have connected and can now try to send a valid connection by sending a connect phrase', function (done) {
            //write connect to the client
            //it('should have written the to the socket, and we can expect a response', function () {
            client.on('data', function () {
                    assert.ok(false, 'We should not have received a response back to MATLAB');
                    done();
                }
            );
            client.write(JSON.stringify(sampleNewData));
            setTimeout(function () {
                assert.ok(true, 'we have not recieved data as was intended');
                done()
            }, 500)

        });
    });
    it('should call the connection again', function (done) {
        assert.isOk(true, 'should never fail');
        done()
    })
});
