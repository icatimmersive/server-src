var socket = require('socket.io-client')('http://dev.mirrorworlds.icat.vt.edu:8888');
var readline = require('readline');

process.stdin.setEncoding('utf8');

socket.on('connect', function(){
    console.log('connected');

    // Connect to the blob data stream
    socket.emit('start', {connectionType: "DATASOURCE"});

    var rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    rl.on('line', function(cmd) {
        var chunk = JSON.parse(cmd);
        
        if (chunk.updateType === "new")
        {
            socket.emit('new', chunk);
        }
        else if (chunk.updateType === "update")
        {
            socket.emit('update', chunk);
        }
        else if (chunk.updateType === "remove")
        {
            socket.emit('remove', chunk);
        }
        else
        {
            console.log("Invalid update type");
        }
    });

    /*
    process.stdin.on('readable', function() {
    var data = process.stdin.read();

    console.log(data);
    var chunk = JSON.parse(data);
    //var chunk = data;

    console.log("======");
    console.log(chunk);
    console.log("======");

	console.log(chunk.updateType);

        if (chunk != null) {
            if (chunk.updateType === "new")
            {
                socket.emit('new', chunk);
            }
            else if (chunk.updateType === "update")
            {
                socket.emit('update', chunk);
            }
            else if (chunk.updateType === "remove")
            {
                socket.emit('remove', chunk);
            }
            else
            {
                console.log("Invalid update type");
            }
        }
    });
    
    process.stdin.on('end', function() {
        socket.emit('remove');
    });*/
});
