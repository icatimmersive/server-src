var socket = require('socket.io-client')('http://dev.mirrorworlds.icat.vt.edu:8888');
//var socket = require('socket.io-client')('http://127.0.0.1:8888');

socket.on('connect', function()
{
	console.log("connected to server");
	
	// Establish your connection with the server
	socket.emit("start", {"connectionType": "LISTENER", "id": "listenerTest"});

	// Listens for new data sources
	socket.on('addSource', function(data)
	{
		console.log("New Data Source: " + data);
	});

	// Listens for new blobs from an established data source
	socket.on('newBlob', function(data)
	{
		console.log("New Blob: " + JSON.stringify(data));
	});

	// Listens for updates to blobs being tracked
	socket.on('updateBlob', function(data)
	{
		console.log("Blob Update: " + JSON.stringify(data));
	});

	// Listens for blobs that leave the scene
	socket.on('removeBlob', function(data)
	{
		console.log("Removed Blob: " + JSON.stringify(data));
	});
});
