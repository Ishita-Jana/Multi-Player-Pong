// Canvas Related 
// const url = 'http://localhost:3000';
const url = 'https://multi-player-pong.onrender.com';

const canvas = document.createElement('canvas');
const context = canvas.getContext('2d');
const socket = io(`${url}/pong`);
let referee = false;
let paddleIndex = 0;

let width = 500;
let height = 700;

// Paddle
let paddleHeight = 10;
let paddleWidth = 90;
let paddleDiff = 25;
let paddleX = [ 225, 225 ];
let trajectoryX = [ 0, 0 ];
let playerMoved = false;

// Ball
let ballX = 250;
let ballY = 350;
let ballRadius = 5;
let ballDirection = 1;

// Speed
// let speedY = 2;
// let speedX = 0;
// let computerSpeed = 4;

let speedX;
let speedY;

//FrameRate
let lastTime = 0;


// Score for Both Players
let score = [ 0, 0 ];

// Create Canvas Element
function createCanvas() {
  canvas.id = 'canvas';
  canvas.width = width;
  canvas.height = height;
  document.body.appendChild(canvas);
  renderCanvas();
}

// Wait for Opponents
function renderIntro() {
  // Canvas Background
  context.fillStyle = 'black';
  context.fillRect(0, 0, width, height);

  // Intro Text
  context.fillStyle = 'white';
  context.font = "32px Courier New";
  context.fillText("Waiting for opponent...", 20, (canvas.height / 2) - 30);
}

// Render Everything on Canvas
function renderCanvas() {
  // Canvas Background
  context.fillStyle = 'black';
  context.fillRect(0, 0, width, height);

  // Paddle Color
  context.fillStyle = 'white';

  // Bottom Paddle
  context.fillRect(paddleX[0], height - 20, paddleWidth, paddleHeight);

  // Top Paddle
  context.fillRect(paddleX[1], 10, paddleWidth, paddleHeight);

  // Dashed Center Line
  context.beginPath();
  context.setLineDash([4]);
  context.moveTo(0, 350);
  context.lineTo(500, 350);
  context.strokeStyle = 'grey';
  context.stroke();

  // Ball
  context.beginPath();
  context.arc(ballX, ballY, ballRadius, 2 * Math.PI, false);
  context.fillStyle = 'white';
  context.fill();

  // Score
  context.font = "32px Courier New";
  context.fillText(score[0], 20, (canvas.height / 2) + 50);
  context.fillText(score[1], 20, (canvas.height / 2) - 30);
}

// Reset Ball to Center
function ballReset() {
  ballX = width / 2;
  ballY = height / 2;
  // speedY = 2;

  socket.emit('ballMoved', {
    ballX,
    ballY,
    score,
  })
}

// Adjust Ball Movement
function ballMove(deltaTime) {

  if (!deltaTime) return;


  const timeFactor = Math.max(deltaTime / 16, 0.1);
  // Vertical Speed
  ballY += speedY * timeFactor * ballDirection;
  // Horizontal Speed
  if (playerMoved) {
    ballX += speedX * timeFactor ;
  }

  socket.emit('ballMoved', {
    ballX,
    ballY,
    score
  })
}

// Determine What Ball Bounces Off, Score Points, Reset Ball
function ballBoundaries() {
  // Bounce off Left Wall
  if (ballX < 0 && speedX < 0) {
    speedX = -speedX;
  }
  // Bounce off Right Wall
  if (ballX > width && speedX > 0) {
    speedX = -speedX;
  }
  // Bounce off player paddle (bottom)
  if (ballY > height - paddleDiff) {
    if (ballX >= paddleX[0] && ballX <= paddleX[0] + paddleWidth) {
      // Add Speed on Hit
      if (playerMoved) {
        speedY += 0.2;
        // Max Speed
        if (speedY > 5) {
          speedY = 5;
        }
        // if(speedX > 5){
        //   speedX = 5;
        // }
      }
      ballDirection = -ballDirection;
      trajectoryX[0] = ballX - (paddleX[0] + paddleDiff);
      speedX = trajectoryX[0] * 0.05;
    } 
    
    if(ballX < paddleX[0] || ballX > paddleX[0] + paddleWidth){
      // Ball hits the edge of the canvas
      if(ballY > height){
        ballReset();
        score[1]++;
      }
      
    }

    
    // else {
    //   // Reset Ball, add to Computer Score
    //   ballReset();
    //   score[1]++;
    // }
  }
  // Bounce off computer paddle (top)
  if (ballY < paddleDiff) {
    if (ballX >= paddleX[1] && ballX <= paddleX[1] + paddleWidth) {
      // Add Speed on Hit
      if (playerMoved) {
        speedY += 0.2;
        // Max Speed
        if (speedY > 5) {
          speedY = 5;
        }
        // if(speedX > 5){
        //   speedX = 5;
        // }
      }
      ballDirection = -ballDirection;
      trajectoryX[1] = ballX - (paddleX[1] + paddleDiff);
      speedX = trajectoryX[1] * 0.05;
    } 
    // if(ballX < paddleX[1] || ballX > paddleX[1] + paddleWidth){
    //   // Ball hits the edge of the canvas
    //   if(ballY < 0){
    //     ballReset();
    //     score[0]++;
    //   }
      
    // }
    if(ballY < 0){
      ballReset();
      score[0]++;
    }
    
  }
}

// Computer Movement
// function computerAI() {
//   if (playerMoved) {
//     if (paddleX[1] + paddleDiff < ballX) {
//       paddleX[1] += computerSpeed;
//     } else {
//       paddleX[1] -= computerSpeed;
//     }
//     if (paddleX[1] < 0) {
//       paddleX[1] = 0;
//     } else if (paddleX[1] > (width - paddleWidth)) {
//       paddleX[1] = width - paddleWidth;
//     }
//   }
// }

// Called Every Frame
function animate(currentTime) {
 // computerAI();

// Calculate the time elapsed since the last frame
 const deltaTime = (currentTime - lastTime) ;
 lastTime = currentTime;
 if(referee){
  ballMove(deltaTime);
  ballBoundaries();
 }
  
  renderCanvas();
 
  window.requestAnimationFrame(animate);
}

// Load Game, Reset Everything



//Start Game
function startGame(initialSpeedX,initialSpeedY) {
  speedX=initialSpeedX;
  speedY=initialSpeedY;
  paddleIndex = referee ? 0 : 1;
  window.requestAnimationFrame(animate);
  canvas.addEventListener('mousemove', (e) => {
    playerMoved = true;
    paddleX[paddleIndex] = e.offsetX;
    if (paddleX[paddleIndex] < 0) {
      paddleX[paddleIndex] = 0;
    }
    if (paddleX[paddleIndex] > (width - paddleWidth)) {
      paddleX[paddleIndex] = width - paddleWidth;
    }

    socket.emit('paddleMoved', {
      paddleIndex: 1-paddleIndex,
      xPosition: paddleX[paddleIndex],
    });
    // Hide Cursor
    canvas.style.cursor = 'none';


  });
}



function loadGame() {
  createCanvas();
  renderIntro();
  socket.emit('ready');
}






socket.on('connection', ()=>{
  console.log('Connected as', socket.id);
});


//Waiting for the second player to join
// socket.on('startGame', (refereeId) => {
//   console.log('Game started', refereeId);
//   referee = socket.id === refereeId;
//   startGame();
//   // console.log('socket id', socket.id);
//   // console.log('Referee', refereeId);
//   // console.log('Referee', referee);
  
  
// })


socket.on('startGame', ({ refereeId, initialSpeedX, initialSpeedY }) => {
  console.log('Game started with referee:', refereeId);
  referee = socket.id === refereeId;
  startGame(initialSpeedX, initialSpeedY);
});


socket.on('paddleMoved', (paddleData) => {
  // Toggle the paddle index to get the opponent paddle index
  const opponentPaddleIndex = 1 - paddleData.paddleIndex;
  paddleX[opponentPaddleIndex] = paddleData.xPosition;
});

socket.on('ballMoved', (ballData) => {
  ballX = ballData.ballX;
  ballY = ballData.ballY;
  score = ballData.score;
});

socket.on('connect_error', (err) => {
  console.error('Connection error:', err);
});


socket.on('disconnect', (reason) => {
  console.log('Disconnected:', reason);
});

// On Load
loadGame();