/* 
 * The client end of the x3dom web system
 */
var sh;
var x3d;

var spawnPosition = {"x":2, "y":1.8, "z":7};
var spawnOrientation = [{"x":-1, "y":1, "z":1}, 0];

var avatar;
var avatarID = "redBoxAvatar";

function init()
{
	sh = new websocketClient(buildList, addUser, remUser, updateList);

	addToPayload(["avatar", avatarID]);

	x3d = document.getElementsByTagName("X3D")[0];
	avatar = document.getElementById(avatarID);

	configureScene();

}

// Builds a scene based on initial location data sent 
// by the server when you connect for the first time.
// (This is currently not supported by the server)
var buildList = function(data)
{
	var userList = document.getElementById("users");
	userList.innerHTML = "";

	for (var key in data)
	{
		var current = data[key];
		var userListEntry = document.createElement('span');
		var br = document.createElement('br');
		userListEntry.setAttribute("id", key);
		userListEntry.innerHTML = (key + " observing at: " + current[1].x + ", " + current[1].y + ", " + current[1].z);
		userList.appendChild(br);					
		userList.appendChild(userListEntry);
	}

	// Update the scene.
	var hook = document.getElementById("avatarGroup");
	hook.innerHTML = "";
	for (var key in data)
	{
		var current = data[key];
		var t = document.createElement('Transform');
		t.setAttribute("translation", current[1].x + " " + current[1].y + " " + current[1].z);
		t.setAttribute("rotation", current[2][0].x + " " + current[2][0].y + " " + current[2][0].z + " " + current[2][1]);
		t.setAttribute("id", key + "Avatar");
		console.log("created Node: " + t.getAttribute("id"));
		var i = document.getElementById(current[3][0][1]).cloneNode(true);

		t.appendChild(i);
		hook.appendChild(t);
	}
}

// Adds a new user to the x3d scene
var addUser = function(data)
{
	var userList = document.getElementById("users");
	var userListEntry = document.createElement('span');
	var br = document.createElement('br');
	userListEntry.setAttribute("id", data[0]);
	userListEntry.innerHTML = (data[0] + " observing at: " + data[1].x + ", " + data[1].y + ", " + data[1].z);
	userList.appendChild(br);
	userList.appendChild(userListEntry);

	// Update the scene.
	var hook = document.getElementById("avatarGroup");

	// Create a new avatar and put it in the scene
	var t = document.createElement('Transform');

	t.setAttribute("translation", data[1].x + " " + data[1].y + " " + data[1].z);
	t.setAttribute("rotation", data[2][0].x + " " + data[2][0].y + " " + data[2][0].z + " " + data[2][1]);
	t.setAttribute("id", data[0] + "Avatar");

	console.log("Created node: " + t.getAttribute("id"));

	var i = document.getElementById(data[3][0][1]).cloneNode(true);

	t.appendChild(i);
	hook.appendChild(t);
}

// removes a user from the x3d scene
var remUser = function(data)
{
	var users = document.getElementById("users");
	var remove2 = document.getElementById(data[0]);
	users.removeChild(remove2);
}

// Updates a user based on server data
var updateList = function(data)
{
	//alert(data[0]);
	var target = document.getElementById(data[0]);
	target.innerHTML = (data[0] + " observing at: " + data[1].x + ", " + data[1].y + ", " + data[1].z);

	// Get the avatar we need to update
	var t = document.getElementById(data[0] + "Avatar");

	var subT = t.getElementsByTagName("Transform")[0];
	//alert(subT.id);

	// Update the avatar if we need to
	if (subT.id != data[3][0][1])
	{
		//alert(subT.id);
		t.innerHTML = "";
		var newAvatar = document.getElementById(data[3][0][1]).cloneNode(true);
		t.appendChild(newAvatar);
	};
	
	// Update the avatar's position and orientation
	if(t != null)
	{
		t.setAttribute("translation", data[1].x + " " + data[1].y + " " + data[1].z);
		t.setAttribute("rotation", data[2][0].x + " " + data[2][0].y + " " + data[2][0].z + " " + data[2][1]);
	};
}

function configureScene()
{
	// This function adds listeners to the Viewpoint nodes and sets up
	// a group node which we can use to contain the avatars

	var camera = x3d.runtime.getActiveBindable("Viewpoint");
	var cPos = "" + spawnPosition.x + " " + spawnPosition.y + " " + spawnPosition.z;
	var cRot = "" + spawnOrientation[0].x + " " + spawnOrientation[0].y + " " + spawnOrientation[0].z + " " + spawnOrientation[1];
	camera.setAttribute("position", cPos);
	camera.setAttribute("orientation", cRot);
	var scene = document.getElementsByTagName("Scene")[0];
	var g = document.createElement('Group');
	g.setAttribute("id", "avatarGroup");
	scene.appendChild(g);

	var cams = document.getElementsByTagName('Viewpoint');

	for (var i = 0; i < cams.length; i++)
	{
		cams[i].addEventListener('viewpointChanged', positionUpdated, false);
	};
}

function updateAvatar(newAvatar)
{
	if(updatePayloadValue(["avatar", newAvatar], true) == false)
	{
		alert("Error updating avatar.");
	}
}
