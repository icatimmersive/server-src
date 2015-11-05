/**
 * Created by Eric on 10/30/2015.
 */


var io = require('socket.io')(8888);
var net = require("net");

var tcpServer = net.createServer(function (socket) {
    console.log('TCP client connected');
    startCallback({"connectionType": "DATASOURCE", "id": "TCP"});
    var firstPartStr = null;
    socket.on('data', function (blobString) {
        var dataSplit = blobString.toString().trim().split('&');
        dataSplit.forEach(function (element) {
            var parsedData;
            try {
                parsedData = JSON.parse(element);
            } catch (e) {
                if (firstPartStr != null) {
                    try {
                        parsedData = JSON.parse(firstPartStr + element);
                        element = firstPartStr + element;
                    }
                    catch (e) {
                        console.log('invalid blob combination ', firstPartStr + element);
                    }
                }
                firstPartStr = element;
                return;
            }
            if (parsedData.age == 'NEW') {
                newCallback(parsedData);
            }
            else if (parsedData.age == 'OLD') {
                updateCallback(parsedData);
            }
            else if (parsedData.age == 'LOST') {
                removeCallback(parsedData);
            }
            else {
                console.log('Blob with invalid age: ', element);
            }
        })
    });

    socket.once('error', function (error) {
        console.log('received an error from the socket ', error);
    });

    socket.once('end', function () {
        console.log('TCP client connection ended');
    })
});

tcpServer.listen(9999);
io.on('connection', function (webSocket) {

    webSocket.once("start", startCallback);

    webSocket.on("new", newCallback);

    webSocket.on("update", updateCallback);

    webSocket.on("remove", removeCallback);

    webSocket.once("disconnect", disconnectCallback);
});

var checkBlobJSON = function (data) {
    if (!data.age) {
        return false;
    }
    if (!data.id) {
        return false;
    }
    return data.cameraID;
};


var startCallback = function (data) {
    if (data.connectionType !== null && data.id !== null) {
        console.log("Starting new connection: " + JSON.stringify(data));

        if (data.connectionType === "DATASOURCE") {
            console.log("New blob with id: " + data.id);
            io.emit("addSource", data);
        }
        else if (data.connectionType === "LISTENER") {
            console.log("New listener with id: " + data.id);
        }
        else if (data.connectionType === "TWOWAY") {
            console.log("New two way connection with id: " + data.id);
            io.emit("addSource", data);
        }
        else {
            console.log("Invalid connection type: " + JSON.stringify(data))
        }
    }
    else {
        console.log("startCallback JSON ERROR: " + JSON.stringify(data));
    }
};

var newCallback = function (data) {
    if (checkBlobJSON(data) === true) {
        if (data.connectionType === "LISTENER") {
            console.log("Listener sent a 'new' update: " + JSON.stringify(data));
        }
        else if (data.connectionType === "DATASOURCE" || data.connectionType === "TWOWAY") {
            io.emit("newBlob", data);
        }
        else {
            console.log("newCallback Invalid connection type: " + JSON.stringify(data));
        }
    }
    else {
        console.log("newCallback JSON ERROR: " + JSON.stringify(data));
    }
};

var updateCallback = function (data) {
    if (checkBlobJSON(data) === true) {
        if (data.connectionType === "LISTENER") {
            console.log("Listener sent an update: " + JSON.stringify(data));
        }
        else if (data.connectionType === "DATASOURCE" || data.connectionType === "TWOWAY") {
            io.emit("updateBlob", data);
        }
        else {
            console.log("updateCallback Invalid connection type: " + JSON.stringify(data));
        }
    }
    else {
        console.log("updateCallback JSON ERROR: " + JSON.stringify(data));
    }
};

var removeCallback = function (data) {
    if (checkBlobJSON(data) === true) {
        if (data.connectionType === "LISTENER") {
            console.log("Listener sent a 'remove' update: " + JSON.stringify(data));
        }
        else if (data.connectionType === "DATASOURCE" || data.connectionType === "TWOWAY") {
            io.emit("removeBlob", data);
        }
        else {
            console.log("Invalid connection type: " + JSON.stringify(data));
        }
    }
    else {
        console.log("removeCallback JSON ERROR: " + JSON.stringify(data));
    }
};

var disconnectCallback = function () {
    console.log('disconnected')
};