var url    = require('url');
var http   = require('http');
var net    = require('net');
var io     = require('socket.io').listen(8888);
var fs = require('fs');

var LOG_FILE_NAME = 'blobLog.txt';

var fileLog = true;
/**
 * writes to the file if file logging is enabled
 */
function logBlob(blob) {
    if (fileLog) {
        fs.appendFile(LOG_FILE_NAME, new Date() + '\t' + blob + '\n', function (err) {
            if (err) {
                console.log('an error occurred ' + err);
            }
        })
    }
}
/**
 * allows us to remove a specific element of the array
 */
Array.prototype.remove = function () {
    var what, a = arguments, L = a.length, ax;
    while (L && this.length) {
        what = a[--L];
        while ((ax = this.indexOf(what)) !== -1) {
            this.splice(ax, 1);
        }
    }
    return this;
};

/**
 * Not currently Used
 * @param data to be validity checked
 * @returns {boolean} if the data is valid
 */
function checkTCPJSON(data) {
    if (data.NEWDATA === null) {
        return false;
    }
    if(data.OLDDATA === null) {return false;}

    return true;
}

function checkBlobJSON(data) {
    if (data.age === null) {return false;}
    if (data.connectionType === null) {return false;}
    if (data.id === null) {return false;}

    if (data.origin === null) {return false;}
    //if (data.origin.x === null) {return false;}
    //if (data.origin.y === null) {return false;}
    //if (data.origin.z === null) {return false;}

    if (data.orientation === null) {return false;}
    //if (data.orientation.x === null) {return false;}
    //if (data.orientation.y === null) {return false;}
    //if (data.orientation.z === null) {return false;}
    //if (data.orientation.theta === null) {return false;}

    if (data.source === null) {return false;}
    if (data.updateTime === null) {return false;}
    if (data.creationTime === null) {return false;}

    if (data.boundingBox === null) {return false;}
    //if (data.boundingBox.x === null) {return false;}
    //if (data.boundingBox.y === null) {return false;}
    //if (data.boundingBox.width === null) {return false;}
    //if (data.boundingBox.height === null) {return false;}

    return true;
}
/**
 * Add an & to the end so matlab can parse multiple coming in
 * @param blobToSend the blob to be broadcast
 */
var broadcastToMatlab = function (blobToSend) {
    matlabClientList.forEach(function (socket) {
        socket.write(blobToSend + "&");
    })
};
var matlabClientList = [];
// TCP socket definitions
net.createServer(function (tcpSocket) {
    // Hook this data source into the system
    /**
     * The connection event is implicitly called by this event
     * having a listener for this does nothing at all
     */
    console.log("TCP client connected");
    startCallback({"connectionType": "DATASOURCE", "id": "TCP"});
    //if (matlabClientList.indexOf(tcpSocket) ==! -1) {
    matlabClientList.push(tcpSocket);
    //}


    var firstPartString = null;
    // Handle incoming messages from clients.
    tcpSocket.on('data', function (data) {
        var dataSplit = data.toString().trim().split("&");
        //console.log("Initial Data: " + data.toString());
        //console.log("===");
        //console.log("dataSplit: " + dataSplit);
        //console.log("========");
        //for (var s in dataSplit) {
        dataSplit.forEach(function (element, index, array) {
            //console.log("element: " + element);
            if (element !== "") {
                var err = false;
                try {
                    var parsedData = JSON.parse(element)
                } catch (e) {
                    err = true;
                    //console.log("JSON error on the element");
                    if (firstPartString != null) {
                        try {
                            parsedData = JSON.parse(firstPartString + element);
                            //console.log("WE had a valid concatenation");
                            element = firstPartString + element;
                            firstPartString = null;
                            err = false;
                        }
                        catch (e) {
                            err = true;
                            firstPartString = element;
                            console.log("we still had an invalid object");
                        }
                    }
                    else {
                        firstPartString = element;
                    }
                }
                if (err === false) {
                    //console.log("_________age: " + parsedData.age);
                    if (parsedData.age == "NEW") {
                        logBlob(element);
                        broadcastToMatlab(element);
                        newCallback(element);
                    }
                    else if (parsedData.age == "OLD") {
                        logBlob(element);
                        broadcastToMatlab(element);
                        updateCallback(element);
                    }
                    else if (parsedData.age == "LOST") {
                        logBlob(element);
                        broadcastToMatlab(element);
                        removeCallback(element);
                    }
                    else {
                        console.log("dataSplit.foreach: Invalid age");
                        console.log(parsedData);
                        console.log(parsedData.age);
                    }
                }
                err = false;
            }
        });
    });

    tcpSocket.on('error', function (err) {
        console.log('we received an error from the socket, should we end it?');
        console.log(err);
        //may want to close the socket
    });

    // Remove the client from the list when it leaves
    tcpSocket.on('end', function () {
        console.log("TCP client disconnected");
        matlabClientList.remove(tcpSocket);
    });
}).listen(9999);

// Socket.io definitions
io.sockets.on('connection', function(webSocket) {
    WEBSOCKET = webSocket;

    webSocket.on("start", startCallback);

    webSocket.on("new", newCallback);

    webSocket.on("update", updateCallback);

    webSocket.on("remove", removeCallback);

    webSocket.on("disconnect", disconnectCallback);
});

// A room for people who are listening for data
var BLOBROOM = "BLOBROOM";
var WEBSOCKET;

// Socket.io callback functions
var startCallback = function(data) {
    if (data.connectionType !== null && data.id !== null)
    {
        console.log("Starting new connection: " + JSON.stringify(data));

        if(data.connectionType === "DATASOURCE") {
            console.log("New blob with id: " + data.id);
            io.sockets.in(BLOBROOM).emit("addSource", data);
        }
        else if(data.connectionType === "LISTENER") {
            console.log("New listener with id: " + data.id);
            WEBSOCKET.join(BLOBROOM);
        }
        else if(data.connectionType === "TWOWAY") {
            console.log("New two way connection with id: " + data.id);
            io.sockets.in(BLOBROOM).emit("addSource", data);
            WEBSOCKET.join(BLOBROOM);
        }
        else {
            console.log("Invalid connection type: " + JSON.stringify(data))
        }
    }
    else
    {
        console.log("startCallback JSON ERROR: " + JSON.stringify(data));
    }
};

var newCallback = function(inData) {
    var data;
    if (typeof inData === 'object') {
        data = inData
    }
    else {
        data = JSON.parse(inData);
    }

    //console.log("==========================" + data.connectionType);
    if (checkBlobJSON(data) === true) {
        if (data.connectionType === "LISTENER") {
            console.log("Listener sent a 'new' update: " + JSON.stringify(data));
        }
        else if (data.connectionType === "DATASOURCE" || data.connectionType === "TWOWAY") {
            //console.log('we are a data source');
            io.sockets.in(BLOBROOM).emit("newBlob", data);
        }
        else {
            console.log("newCallback Invalid connection type: " + JSON.stringify(data));
        }
    }
    else
    {
        console.log("newCallback JSON ERROR: " + JSON.stringify(data));
    }
};

var updateCallback = function(inData) {
    var data;

    if (typeof inData === 'object') {
        data = inData
    }
    else {
        data = JSON.parse(inData);
    }

    //console.log("________________________" + data);
    if (checkBlobJSON(data) === true) {
        if (data.connectionType === "LISTENER") {
            console.log("Listener sent an update: " + JSON.stringify(data));
        }
        else if (data.connectionType === "DATASOURCE" || data.connectionType === "TWOWAY") {
            io.sockets.in(BLOBROOM).emit("updateBlob", data);
        }
        else {
            console.log("updateCallback Invalid connection type: " + JSON.stringify(data));
        }
    }
    else {
        console.log("updateCallback JSON ERROR: " + JSON.stringify(data));
    }
};

var removeCallback = function(inData) {
    var data;

    if (typeof inData === 'object') {
        data = inData
    }
    else {
        data = JSON.parse(inData);
    }
    if (checkBlobJSON(data) === true) {
        if (data.connectionType === "LISTENER") {
            console.log("Listener sent a 'remove' update: " + JSON.stringify(data));
        }
        else if (data.connectionType === "DATASOURCE" || data.connectionType === "TWOWAY") {
            io.sockets.in(BLOBROOM).emit("removeBlob", data);
        }
        else {
            console.log("Invalid connection type: " + JSON.stringify(data));
        }
    }
    else {
        console.log("removeCallback JSON ERROR: " + JSON.stringify(data));
    }
};

var disconnectCallback = function() {
    console.log('disconnected')
};
