
let readyPlayersCount = 0;

function listen(io) {
    
    //creating namespace
    const pongNamespace = io.of('/pong');     

    // io.on('connection', (socket) => {
    //     console.log('Client connected',socket.id);


    //     socket.on('ready', () => {
    //         console.log('Player ready', socket.id);
            
    //         readyPlayersCount++;
    //         // console.log('readyPlayersCount', readyPlayersCount);
    //         if(readyPlayersCount === 2){
    //             io.emit('startGame', socket.id);
    //             readyPlayersCount = 0;
                
    //         }
    //     });

    pongNamespace.on('connection', (socket) => {
        console.log('Client connected',socket.id);
        let room;


        socket.on('ready', () => {
            
            room = 'room' + Math.floor(readyPlayersCount/2);
            socket.join(room);

            console.log('Player ready', socket.id, room);
            
            readyPlayersCount++;
            // console.log('readyPlayersCount', readyPlayersCount);
            if(readyPlayersCount % 2==0){
                // pongNamespace.emit('startGame', socket.id);
                pongNamespace.in(room).emit('startGame', socket.id);
                
                
            }
        });


        socket.on('paddleMoved', (paddleData) => {
           
            // socket.broadcast.emit('paddleMoved', paddleData);
            socket.to(room).emit('paddleMoved', paddleData);
        });

        socket.on('ballMoved', (ballData) => {
           
            // socket.broadcast.emit('ballMoved', ballData);
            socket.to(room).emit('ballMoved', ballData);
        });  

        socket.on('disconnect', (reason) => {
            console.log(`Client disconnected, ${socket.id} for ${reason}`);
            socket.leave(room);
        });
    });
}

module.exports = {
    listen,
}