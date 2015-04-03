var socket = require('socket.io-client')('http://dev.mirrorworlds.icat.vt.edu:8888');

var DIRECTCONNECT = false;

// Organize some dummy data to transmit through the server.
var connectionType = "DATASOURCE";
var id = "DSTest";
var origin = {x: 1.0, y: 2.0, z: 3.0};
var orientation = {x: 0.0, y: 0.0, z: 0.0, theta: 0.0};
var source = "datasource test";
var updatedTime = "now";
var creationTime = "recently";
var boundingBox = {x: 0.0, y: 0.0, width: 10.0, height: 10.0};

var newData = {
	connectionType: connectionType,
	updateType: "new",
	id: id,
	origin: origin,
	orientation: orientation,
	source: source,
	updatedTime: updatedTime,
	creationTime: creationTime,
	boundingBox: boundingBox
}

var updateData = {
	connectionType: connectionType,
	updateType: "update",
	id: id,
	origin: origin,
	orientation: orientation,
	source: source,
	updatedTime: updatedTime,
	creationTime: creationTime,
	boundingBox: boundingBox
}

var removeData = {
	connectionType: connectionType,
	updateType: "remove",
	id: id,
	origin: origin,
	orientation: orientation,
	source: source,
	updatedTime: updatedTime,
	creationTime: creationTime,
	boundingBox: boundingBox
}

socket.on('connect', function()
{
	//console.log('connected to server');

	if(DIRECTCONNECT)
	{
		console.log('start');
		socket.emit('start', {connectionType: "DATASOURCE", id: "RapidDSTest"});
	}
	else{console.log(JSON.stringify({connectionType: "DATASOURCE", id: "RapidDSTest"}));}

	// Send data quickly, try to break the pipes

	if(DIRECTCONNECT)
	{
		console.log('new');
		socket.emit('new', newData);
	}
	else{console.log(JSON.stringify(newData));}

	setInterval(function()
	{
		if(DIRECTCONNECT)
		{
			console.log('update');
			socket.emit('update', updateData);
		}
		else{console.log(JSON.stringify(updateData));}
	}, 200);
});
