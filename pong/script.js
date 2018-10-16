document.addEventListener("DOMContentLoaded", function(event) { 
  initGame();
});

function listenKeys() {
	document.addEventListener('keypress', (event) => {
	  const keyName = event.key;

	  if (keyName == 'a') {
	  	movePad('left');
	  } else if (keyName == 'd') {
	  	movePad('right');
	  }
	});
}

let canvas;
let ctx;

const canvasWidth = 500;
const canvasHeight = 300;

let timer;

let padWidth = 60;
let padPosition = (canvasWidth / 2);
const padSpeed = 6;
const padY = 10;
const padHeight = 5;

const ballRadius = 8;
let ballX = 50;
let ballY = 50;
let ballVelocityX = 1;
let ballVelocityY = -1;

let score = 0;

function initGame() {
	initCanvas();
	listenKeys();

	timer = setInterval(gameLoop, 16);
}

function gameLoop() {
	drawRect(0, 0, canvasWidth, canvasHeight, '#FFFFFF'); // clear screen
	drawPad();
	moveBall();
	padCollide();
	drawBall();
	drawScores();
}

function initCanvas() {
	canvas = document.getElementById("canvas");
	ctx = canvas.getContext("2d");
}

function drawRect(x, y, width, height, color) {
	ctx.fillStyle = color;
	ctx.fillRect(x, y, width, height);
}

function drawPad() {
	drawRect(padPosition - padWidth / 2, canvasHeight - padY, padWidth, padHeight, '#000000')
}

function drawBall() {
	ctx.beginPath();
	ctx.fillStyle = '#000000';
	ctx.arc(ballX, ballY, ballRadius, 0, 2 * Math.PI, false);
	ctx.fill();
	ctx.closePath();
}

function drawScores() {
	text('Score: ' + score, 3,20, '16px arial');
}

function text(value, x, y, font) {
	font = font || '30px arial';
	ctx.font = font;
	ctx.fillText(value, x, y);
}

function stroke(x1, y1, x2, y2, color) {
	color = color || '#000000';
	ctx.beginPath();
	ctx.moveTo(x1, y1);
	ctx.lineTo(x2, y2);
	ctx.strokeStyle = color;
	ctx.stroke()
	ctx.closePath();
}

function padCollide() {
	//stroke(0, canvasHeight - padY, canvasWidth, canvasHeight - padY, '#FF0000');
	if (ballY > canvasHeight - padY - padHeight) {
		if (ballX > padPosition - padWidth / 2 && ballX < padPosition + padWidth / 2) {
			ballVelocityY = ballVelocityY * -1
		}
	}
}

function brutalize() {
	// make game more difficult based on scores
	if (score % 3 == 0) {
		ballVelocityX = ballVelocityX * 1.1;
		ballVelocityY = ballVelocityY * 1.1;
	}
}

function moveBall() {
	if (ballX < ballRadius / 2) { // left border
		ballVelocityX = ballVelocityX * -1
	} else if (ballX > canvasWidth - ballRadius / 2) { // Right border
		ballVelocityX = ballVelocityX * -1
	}

	if (ballY < ballRadius / 2) { // Top border
		ballVelocityY = ballVelocityY * -1
		score += 1
		brutalize()

	} else if (ballY > canvasHeight - ballRadius / 2) { // Bottom border
		ballVelocityY = ballVelocityY * -1
		endGame();
	}
	ballX += ballVelocityX;
	ballY += ballVelocityY;
}

function movePad(direction) {
	if (direction == 'left') {
		if (padPosition > padWidth / 2) {
			padPosition -= padSpeed;
		}
	} else if (direction == 'right') {
		if (padPosition < canvasWidth - padWidth / 2) {
			padPosition += padSpeed;
		}
	}
}

function endGame() {
	clearInterval(timer);
	alert('Game over!\n You got score of: ' + score + '!');
}