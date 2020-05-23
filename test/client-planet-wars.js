const ws = require('websocket').client;

const URL = 'https://localhost:8080/socket';
//const URL = 'https://api.wartemis.com/socket';

function start() {
  setupNewSocket(URL);
}

function setupNewSocket(endpoint) {
  let socket = new ws();

  socket.on('connectFailed', function(error) {
    console.error('Connect Error: ' + error.toString());
  });

  socket.on('connect', connection => {
    console.log('connected!');

    connection.on('error', error => {
      console.log('error: ' + error);
    });

    connection.on('close', () => {
      console.log('closed');
    });

    connection.on('message', handleMessage.bind(undefined, connection));
  });

  console.log(`connecting to socket @ ${endpoint}`);
  socket.connect(endpoint);
}

function sendMessage(connection, message) {
  connection.sendUTF(JSON.stringify(message));
}

function handleMessage(connection, message) {
  if(message.type !== 'utf8')
    console.log('Got a non-text message, ignoring');
  message = JSON.parse(message.utf8Data);

  console.log(`Got a ${message.type} message!`);

  switch(message.type) {
    case 'connected': handleConnectedMessage(connection, message); break;
    case 'registered': handleRegisteredMessage(connection, message); break;
    case 'invite': handleInviteMessage(connection, message); break;
    case 'state': handleStateMessage(connection, message); break;
  }
}

function handleConnectedMessage(connection, message) {
  console.log('connected!');
  sendMessage(connection, {
    type: 'register',
    clientType: 'bot',
    name: 'Robbot'
  });
}

function handleRegisteredMessage(connection, message) {
  console.log(`Registered with id ${message.id}!`);
  connection.id = message.id;
}

function handleInviteMessage(connection, message) {
  console.log(`invited to room ${message.room}!`);
  setupNewSocket(URL + '/' + message.room);
}

function handleStateMessage(connection, message) {
  console.log(JSON.stringify(message));
  setTimeout(() => {
    const source = message.state.planets.find(p => p.player === connection.id);
    const others = message.state.planets.filter(p => p.player !== connection.id);
    const target = others[Math.floor(Math.random()*others.length)];
    sendMessage(connection, {
      type: 'action',
      action: {
        moves: [{
          source: source.id,
          target: target.id,
          ships: 1,
        }]
      }
    });
  }, 50);
}

start();