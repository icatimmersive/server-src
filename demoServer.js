// Prototype server implementation for mirror worlds demo
// on Friday, February 20

var url    = require('url');
var http   = require('http');
var net = require('net');
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

net.createServer(function (socket) { 

// Handle incoming messages from clients.
socket.on('data', function (data) {
    console.log(data.toString());
});
 
// Remove the client from the list when it leaves
socket.on('end', function () {
    console.log("client disconnected");
});
}).listen(9999);

// A room for people who are listening for data
var BLOBROOM = "BLOBROOM";

io.sockets.on('connection', function(socket) {

    socket.on("start", function(data)
    {
    	console.log("Starting new connection: " + data);

        if(data.connectionType === "DATASOURCE")
        {
        	console.log("New blob with id: " + data.id);
        	io.sockets.in(BLOBROOM).emit("addSource", data);
        }
        else if(data.connectionType === "LISTENER")
        {
        	console.log("New listener with id: " + data.id);
        	socket.join(BLOBROOM);
        }
        else if(data.connectionType === "TWOWAY")
        {
        	console.log("New two way connection with id: " + data.id);
        	io.sockets.in(BLOBROOM).emit("addSource", data);
        	socket.join(BLOBROOM);
        }
        else
        {
        	console.log("Invalid connection type: " + JSON.stringify(data))
        }
    });

    socket.on("new", function(data)
    {
    	if (checkBlobJSON(data) == true)
        {
        	if (data.connectionType === "LISTENER")
        	{
        		console.log("Listener sent a 'new' update: " + JSON.stringify(data));
        	}
        	else if (data.connectionType === "DATASOURCE" || data.connectionType === "TWOWAY")
        	{
        		io.sockets.in(BLOBROOM).emit("newBlob", data);
        	}
        	else
        	{
        		console.log("Invalid connection type: " + JSON.stringify(data));
        	}
        }
        else
        {
        	console.log("JSON ERROR: " + JSON.stringify(data));
        }
    });

    socket.on("update", function(data)
    {
        if (checkBlobJSON(data) == true)
        {
        	if (data.connectionType === "LISTENER")
        	{
        		console.log("Listener sent an update: " + JSON.stringify(data));
        	}
        	else if (data.connectionType === "DATASOURCE" || data.connectionType === "TWOWAY")
        	{
        		io.sockets.in(BLOBROOM).emit("updateBlob", data);
        	}
        	else
        	{
        		console.log("Invalid connection type: " + JSON.stringify(data));
        	}
        }
        else
        {
        	console.log("JSON ERROR: " + JSON.stringify(data));
        }

    });

    socket.on("remove", function(data)
    {
        if (checkBlobJSON(data) == true)
        {
        	if (data.connectionType === "LISTENER")
        	{
        		console.log("Listener sent a 'remove' update: " + JSON.stringify(data));
        	}
        	else if (data.connectionType === "DATASOURCE" || data.connectionType === "TWOWAY")
        	{
        		io.sockets.in(BLOBROOM).emit("removeBlob", data);
        	}
        	else
        	{
        		console.log("Invalid connection type: " + JSON.stringify(data));
        	}
        }
        else
        {
        	console.log("JSON ERROR: " + JSON.stringify(data));
        }

    });

    socket.on("disconnect", function() {
        console.log('disconnected')
    });
});
