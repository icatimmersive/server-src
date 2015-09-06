var expr   = require('express');
var url    = require('url');
var http   = require('http');
var fs     = require('fs');
var multer = require('multer');
var unzip  = require('unzip');

var app    = expr();
var server = app.listen(8888);
var io     = require('socket.io').listen(server);

// The world list holds world objects.
// World objects contains a name and a user-list
// User objects have a  name, position, avatar, orientation, and payload
var worldlist = {};

function constructWorld(name){
    var world = {'name': name, 'userlist':{}};
    return world;
}

function init() {
    fs.readdir('./worlds/', function(err, files){
        files.forEach(function(file){
            var stats = fs.statSync(__dirname + '/worlds/' + file);
            if(stats.isDirectory()){ 
                worldlist[file] = constructWorld(file); 
            }
        });
        console.log(worldlist);
    });
}

//=====================//
// Express Definitions //
//=====================//

// Receives uploaded files when creating a new world
app.use(multer({dest: "."}));
app.post('/uploadWorld', function(req, res) {

    // get name of world and file info from req
    console.log(req.body);
    var worldname = req.body.worldName;
    var tempPath = req.files.worldFiles.path;
    var targetPath = req.files.worldFiles.name;
    worldlist[worldname] = constructWorld(worldname);

    // save uploaded file to server
    fs.rename(tempPath, targetPath, function(err) {
        if (err) throw err;

        fs.unlink(tempPath, function() {
            if (err) throw err;
        });
    });

    // create subfolders for the new world
    fs.mkdirSync("worlds/" + worldname);
    fs.mkdirSync("worlds/" + worldname + "/assets");

    // move and unzip the uploaded folder
    fs.createReadStream(targetPath).pipe(unzip.Extract({ path: "worlds/" + worldname + '/assets/' }));

    // add world manager page
    fs.writeFileSync("worlds/" + worldname + "/" + worldname + "_management.html", 
        fs.readFileSync("templates/manager.html"));

    // add users.txt
    fs.writeFileSync("worlds/" + worldname + "/" + worldname + "_users.txt", "herp, derp");

    // add inactivity page
    fs.writeFileSync("worlds/" + worldname + "/" + worldname + "_inactive.html", fs.readFileSync("templates/inactive.html"));
    
    // add settings file
    fs.writeFileSync("worlds/" + worldname + "/" + worldname + "_settings.txt", "default settings (whatever that means)");

    // send uploader back to home page
    res.redirect("back");
});

// serves list of currently active worlds
app.get('/worldList', function(req, res) {
  res.json(worldlist);
  console.log("Serving worldlist");
});

// serves homepage
app.get('/', function(req, res){
    res.sendfile(__dirname + '/index.html');
    console.log('Serving ' + __dirname + '/index.html');
});

// serves management page
app.get('/worlds/[\\w]+/manage', function(req, res){
    var path = url.parse(req.url).pathname; 
    path = path.substr(0, path.search('/manage'));
    
    res.sendfile(__dirname + path + '/manage.html');
    console.log('Serving ' + __dirname + path + '/manage.html');
});

app.get('/worlds/[\\w]+/assets/*', function(req, res){
    var path = url.parse(req.url).pathname; 
    res.sendfile(__dirname + path);
    console.log('Serving ' + __dirname + path);
});

// serves world page
app.get('/worlds/[\\w]+', function(req, res){
    var path = url.parse(req.url).pathname;
    res.sendfile(__dirname + path + '/assets/index.html');
    console.log('Serving ' + __dirname + path + '/assets/index.html');
});

app.get('*', function(req, res) {
    console.log(req.url);
    res.sendfile(__dirname + req.url);
});

//=======================//
// Socket.io Definitions //
//=======================//

// socket.io functions to handle world clients
io.sockets.on('connection', function(socket) {
    
    // data: {'world':'', 'user': {'name': '', 'position': '', 'orientation': '', 'payload: ''}} 
    socket.on('start', function(data){
        var currentWorld = worldlist[data.world];
        var currentUsers = currentWorld.userlist;
        
        // join the correct world instance
        socket.join(data.world);
       
        // we need to store some information on the socket; mostly for the disconnect event 
        socket.world = data.world;
        socket.name = data.user.name;
       
        // send information about all the other users to this one 
        socket.emit('userlist', currentUsers);

        // Add new user to the worldlist
        currentUsers[data.user.name] = data.user; 
        
        // send information about this user to all the others 
        socket.broadcast.to(data.world).emit('adduser', data.user);   
        socket.broadcast.to(data.world).emit('printmessage', 'User ' + data.user.name +
            ' has connected');
        
        console.log('User ' + data.user.name + ' has connected to ' + currentWorld.name);
    });
   
    // no data can be passed to the disconnect function 
    socket.on('disconnect', function(){
        var currentWorld = worldlist[socket.world];
        var currentUsers = currentWorld.userlist;
        
        // leave the world instance 
        socket.leave(socket.world);
        
        // inform everyone
        socket.broadcast.to(socket.world).emit('deluser', socket.name); 
        socket.broadcast.to(socket.world).emit('printmessage', 'User ' + socket.name +
            ' has disconnected');
       
         // delete on server side 
        delete currentUsers[socket.name];  
        console.log('User ' + socket.name + ' has disconnected');
    });

    // data: {'user': {'name': '', 'position': '', 'orientation': '', 'payload: ''}} 
    socket.on('update', function(data) {
        console.log(data);
        var currentWorld = worldlist[socket.world];
        var currentUsers = currentWorld.userlist;

        currentUsers[data.user.name] = data.user;

        socket.broadcast.to(socket.world).emit('update', data.user);   
    });

    // data: {'name': '', 'message': ''} 
    socket.on('message', function(data){
        socket.broadcast.to(socket.world).emit('printmessage', data.name + ': ' +  data.message);
        console.log(data.name + ': ' +  data.message);
    });
});

// actually call the init function
init();
