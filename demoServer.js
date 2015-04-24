var url    = require('url');
var http   = require('http');
var net    = require('net');
var io     = require('socket.io').listen(8888);

function checkBlobJSON(data)
{
	if (data.id == null) {return false};
	if (   data.origin.x == null
		|| data.origin.y == null
		|| data.origin.z == null) {return false};
	if (   data.orientation.x == null
		|| data.orientation.y == null
		|| data.orientation.z == null
		|| data.orientation.theta == null) {return false};
	if (data.source == null) {return false};
	if (data.updatedTime == null) {return false};
	if (data.creationTime == null) {return false};
	if (data.boundingBox.x == null
		|| data.boundingBox.y == null
		|| data.boundingBox.width == null
		|| data.boundingBox.height == null) {return false};

	return true
}

// TCP socket definitions
net.createServer(function (tcpSocket) { 
    // Hook this data source into the system
    tcpSocket.on('connect', function() {
        console.log("TCP client connected");
        startCallback({"connectionType": "DATASOURCE", "id": "TCP"});
    });

    // Handle incoming messages from clients.
    tcpSocket.on('data', function (data) {
        var dataSplit = data.toString().split("&");

        for (var s in dataSplit) {
            var parsedData = JSON.parse(s);

            console.log(data.toString() + "\n");
            
            for (var d in parsedData) {
                if (d.age === "NEW") {
                    newCallback(d);
                }
                else if (d.age === "OLD") {
                    updateCallback(d);
                }
                else {
                    console.log("Invalid age parameter");
                }
            }
        }
    });
     
    // Remove the client from the list when it leaves
    tcpSocket.on('end', function () {
        console.log("TCP client disconnected");
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
    console.log("Starting new connection: " + data);

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
};

var newCallback = function(data) {
    if (checkBlobJSON(data) == true) {
        if (data.connectionType === "LISTENER") {
            console.log("Listener sent a 'new' update: " + JSON.stringify(data));
        }
        else if (data.connectionType === "DATASOURCE" || data.connectionType === "TWOWAY") {
            io.sockets.in(BLOBROOM).emit("newBlob", data);
        }
        else {
            console.log("Invalid connection type: " + JSON.stringify(data));
        }
    }
    else
    {
        console.log("JSON ERROR: " + JSON.stringify(data));
    }
};

var updateCallback = function(data) {
    if (checkBlobJSON(data) == true) {
        if (data.connectionType === "LISTENER") {
            console.log("Listener sent an update: " + JSON.stringify(data));
        }
        else if (data.connectionType === "DATASOURCE" || data.connectionType === "TWOWAY") {
            io.sockets.in(BLOBROOM).emit("updateBlob", data);
        }
        else {
            console.log("Invalid connection type: " + JSON.stringify(data));
        }
    }
    else {
        console.log("JSON ERROR: " + JSON.stringify(data));
    }
};

var removeCallback = function(data) {
    if (checkBlobJSON(data) == true) {
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
        console.log("JSON ERROR: " + JSON.stringify(data));
    }
};

var disconnectCallback = function() {
    console.log('disconnected')
};
