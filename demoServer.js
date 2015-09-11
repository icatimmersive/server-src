var url    = require('url');
var http   = require('http');
var net    = require('net');
var io     = require('socket.io').listen(8888);

function checkTCPJSON(data) {
	if(data.NEWDATA === null) {return false;}
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

// TCP socket definitions
net.createServer(function (tcpSocket) { 
    // Hook this data source into the system
    tcpSocket.on('connect', function() {
        console.log("TCP client connected");
        startCallback({"connectionType": "DATASOURCE", "id": "TCP"});
    });

    var firstPartString = null;
    // Handle incoming messages from clients.
    tcpSocket.on('data', function (data) {
        var dataSplit = data.toString().trim().split("&");
	//console.log("Initial Data: " + data.toString());
	//console.log("===");
	//console.log("dataSplit: " + dataSplit);
	//console.log("========");

        //for (var s in dataSplit) {
	dataSplit.forEach(function(element, index, array) {
	    //console.log("element: " + element);
	    if(element !== "")
	    {
		var err = false;

		try {
			var parsedData = JSON.parse(element)
		} catch(e) {
			err = true;
            console.log("JSON error on element");
                        if (firstPartString != null)
                        {
                          try{
                           parsedData = JSON.parse(firstPartString + element);
                              console.log("WE had a valid concatenation");
                              element = firstPartString + element;
                           err = false;
                          }
                          catch(e){
                           err = true;
                           firstPartString = element;
                           console.log("we still had an invalid object");
                          }
                        }
                        else{
                         firstPartString = element;
                        }
		}
		if(err === false) {
            		//console.log("_________age: " + parsedData.age);
			if(parsedData.age == "NEW")
			{
				newCallback(element);
			}
			else if(parsedData.age == "OLD")
			{
				updateCallback(element);
			}
			else if(parsedData.age == "LOST")
			{
				removeCallback(element);
			}
			else
			{
				console.log("dataSplit.foreach: Invalid age");
				console.log(parsedData);
				console.log(parsedData.age);
			}
		}
		err = false;
	    }
        });
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
    if (data.conenctionType !== null && data.id !== null)
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

	if(typeof inData === 'object') {
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

	if(typeof inData === 'object') {
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

	if(typeof inData === 'object') {
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
