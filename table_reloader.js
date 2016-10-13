socket = require('socket.io-client')('http://mw.icat.vt.edu:8888');
socket.emit('start', {connectionType: 'DATASOURCE'});


socket.on('connect', function() {
   console.log('connected to the server!');

   console.log('sending the reload blob to reload the csv');

   socket.emit('reload', {});
   console.log('sent the data to the server the table should be reloaded, now exit');
//   process.exit();
});
