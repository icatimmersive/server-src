/* 
 * Implemntation of multi-user X3DOM - client side.
 * author: Matthew Bock
 * This version focuses on minimizing data transfer, but it still
 * sends and receives updates as soon as they happen with no regard
 * to time since the last update.
 */

var socket;

var name;
var worldname;
var user;
var currPosition = {"x":2, "y":1.8, "z":7};
var currOrientation = [{"x":-1, "y":1, "z":1}, 0];
var payload = [];


function websocketClient(userlist, addUser, delUser, update)
{

	var urlstuff = document.URL.split('/');
	worldname = urlstuff[4];
	name = prompt("Enter your name:");
	


	user = {'name': name, 'position': currPosition, 'orientation': currOrientation, 'payload': 'box'};

	socket = new io.connect('localhost:8888');

	socket.on('connect', function()
		{
			// Tell the server to add this client to the list of all clients.
			socket.emit('start', {'world': worldname, 'user': user} );
		});

	socket.on('userlist', function(data)
		{
			// Recieved the first time this client connects to the server.
			// Gets the client up to speed with all of the current data.
			// Not currently supported by the server end

			// Send the data to the callback, may need to reorganize data in a way that the x3d script will understand
			if(userlist != null)
			{
				userlist(data);
			}
			socket.emit('login', name, currPosition, currOrientation, payload);
		});

	socket.on('updateBlob', function(data)
		{
			// Fire the update callback
			if (update != null)
			{
				update(data);
			}
		});

	socket.on('newBlob', function(data)
		{
			if(data[0] != name)
			{

				// Fire the new user callback
				if (addUser != null)
				{
					addUser(data);
				}
			}

		});

	socket.on('removeBlob', function(data)
		{
			// Remove the avatar from the scene.
			var avatars = document.getElementById("avatarGroup");
			var remove1 = document.getElementById(data[0] + "Avatar");
			avatars.removeChild(remove1);
			
			// Fire the removal callback
			if (delUser != null)
			{
				delUser(data);
			}
		});
}


var positionUpdated = function(e)
{			
	currPosition = e.position;
    currOrientation = e.orientation;
    //console.log([name, pos, rot]);

    //Tell the server that this client has moved and send its new location data
	socket.emit('update', {'user': user});

};

function addToPayload(data)
{
	payload.push(data);
	socket.emit('update', {'user': user});

}

function updatePayloadValue(data, forceUpdate)
{
	for (var i = payload.length - 1; i >= 0; i--)
	{
		if(payload[i][0] == data[0])
		{
			payload[i] = data;
			if (forceUpdate)
			{
				socket.emit('update', {'user': user});

			}
			return true;
		}
	}
	return false;
}
