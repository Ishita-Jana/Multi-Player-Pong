/* Description: This file is the entry point for the server. 
It creates a http server and listens on port 3000 for connections.
It also creates a socket.io server and listens for connections on the same port. 
It then calls the listen function in the sockets.js file to listen for socket events.
*/
const http = require('http');
const socketIo = require('socket.io');

const apiServer = require('./api');
const sockets = require('./sockets');


const httpServer = http.createServer(apiServer);
const socketServer = socketIo(httpServer, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST']
    }
  });


const port = 3000;

httpServer.listen(port);
console.log('Server listening at port %d', port);

sockets.listen(socketServer);


