const readline = require('readline');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});
var newSw = false;
rl.setPrompt('Enter close to close the database or new to open a new one:\n');
rl.prompt();
var socket = require('socket.io-client')('http://dev.mirrorworlds.icat.vt.edu:4444');
rl.on('line', function (line) {
    switch (line.trim()) {
        case 'close':
            newSw = false;
            socket.emit('close');
            console.log('closed the MongoDB server');
            rl.prompt();
            break;
        case 'new':
            console.log('you typed new\nnow type in a datbase name or close to abort switching to a new database');
            newSw = true;
            break;
        default:
            if (newSw) {
                console.log('creating a new database with the name: ' + line);
                socket.emit('new', line);
                rl.prompt();
            }
            else {
                console.log('unrecognized command. Did you mean to type new before?');
                rl.prompt()
            }
            newSw = false;
            break;
    }
});