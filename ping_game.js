var method = PingGame.prototype;

function PingGame(socket_to_emit){
  this.socket_to_emit = socket_to_emit;
  var ball_x_loc = -64/3.0;
  var ball_y_loc = 0.5;
  var ball_z_loc = 1;
  var ball_x_max = 19/3.0;
  var ball_x_min = -63/3.0;
  var ball_movement_rate = 1/30.0;
  second_per_step = 1/100.0;
  socket_to_emit.on('connection', function(websocket){
    websocket.on('ballCollision', collision);
  });
  function collision(data){
    //console.log('received collision');
    ball_movement_rate *= -1;
  }
  //socket_to_emit.on('ballCollision', collision);


//move in the x direction
  function begin_game(){
    //console.log('updating blob movement');
    ball_x_loc += ball_movement_rate;
    //console.log(ball_x_loc);
    if (ball_x_loc <= ball_x_min){
      ball_movement_rate = Math.abs(ball_movement_rate);
    }
    else if (ball_x_loc >= ball_x_max){
      ball_movement_rate = Math.abs(ball_movement_rate) * -1;
    }
    //console.log(socket_to_emit);
    socket_to_emit.emit('ballLocation',{xCoord: ball_x_loc, yCoord: ball_y_loc, zCoord: ball_z_loc});
    setTimeout(begin_game, second_per_step * 1000);
  };
  begin_game();

};


module.exports = PingGame;
