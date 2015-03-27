// Prototype server implementation for mirror worlds demo
// on Friday, February 20

var url    = require('url')
var http   = require('http')

var io     = require('socket.io')({
	transports: ['websocket'],
});
io.attach(8888);

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

// A room for people who are listening for data
var BLOBROOM = "BLOBROOM";

io.sockets.on("connection", function(socket) {

socket.on("start", function(data)
{
	console.log(data);
	// {connectionType: LISTENER}

    if(data.connectionType === "DATASOURCE")
    {
    	console.log("New blob with id: " + data.id);
    	io.sockets.in(BLOBROOM).emit("addSource", data);
    }
    else if(data.connectionType === "LISTENER")
    {
    	console.log("New listener connected");
    	socket.join(BLOBROOM);
    }
    else if(data.connectionType === "TWOWAY")
    {
    	console.log("New two way connection");
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
    console.log('removing');

    // Format data?
    //socket.broadcast.to("clients").emit("delUser", data);
    if (checkBlobJSON(data) == true)
    {
    	io.sockets.in(BLOBROOM).emit("deluser", data);
    }
    else
    {
    	console.log("JSON ERROR: " + JSON.stringify(data));
    }
    // update list of blobs
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
    console.log('blobs disconnected')
});

});
