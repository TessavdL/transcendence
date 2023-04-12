<template>
	<div class="pong-game">
		<div class="start-button-container">
		<button @click="toggleGame">{{ gameStarted ? 'Stop' : 'Start' }}</button>
	</div>
	<div class="player1-paddle" :style="{ top: player1Position + 'px' }"></div>
	<div class="player2-paddle" :style="{ top: player2Position + 'px' }"></div>
	<div class="ball" :style="{ top: ballPosition.top + 'px', left: ballPosition.left + 'px' }"></div>
	</div>
</template>

<script>
	import io from 'socket.io-client';

	export default {
	data() {
		return {
		player1Position: 0,
		player2Position: 0,
		ballPosition: { top: 290, left: 390 },
		ballVelocity: { x: 5, y: 5 },
		socket: null,
		gameStarted: false,
		};
	},
	mounted() {
		this.socket = io('http://localhost:3001/pong-game', { withCredentials: true });
		this.socket.on('updateGameState', (gameState) => {
		this.player1Position = gameState.player1Position;
		this.player2Position = gameState.player2Position;
		this.ballPosition = gameState.ballPosition;
	});
	window.addEventListener('keydown', (event) => {
		if (event.key === 'ArrowUp') {
		  this.movePaddle(-15); // move the paddle up by 10 pixels
		} else if (event.key === 'ArrowDown') {
		  this.movePaddle(15); // move the paddle down by 10 pixels
		}
	});
	this.socket.on('movePaddle', (position) => {
		// Update the position of the paddle based on the position received from the socket
		this.player2Position += position;
	});
	},
	methods: {
		toggleGame() {
		if (this.gameStarted) {
			this.gameStarted = false;
		} else {
			this.gameStarted = true;
		  this.update(); // call the update method to start the game loop
		}
	},
		movePaddle(position) {
		const newPosition = this.player1Position + position;
		if (newPosition <= 500 && newPosition >= 0) {
			this.socket.emit('movePaddle', position);
			this.player1Position = newPosition;
		}
	},
		update() {
		if (!this.gameStarted) return;
		
		const paddleLeftEdge = this.player1Position;
		const paddleRightEdge = this.player1Position + 100; // paddle width is 100 pixels

		const ballPosition = {
			top: this.ballPosition.top + this.ballVelocity.y,
			left: this.ballPosition.left + this.ballVelocity.x,
		};
	
		if (ballPosition.top <= 0 || ballPosition.top >= (600 - 20)) {
		this.ballVelocity.y = -this.ballVelocity.y;
		}
		if (ballPosition.left <= 0 || ballPosition.left >= (800 - 20)) {
		this.ballVelocity.x = -this.ballVelocity.x;
		}
		this.socket.emit('updateBallPosition', ballPosition);
		this.ballPosition = ballPosition;
		console.log('Ball position:', ballPosition);
		requestAnimationFrame(this.update);
		},
	},
};

</script>

<style>
.pong-game {
	position: fixed;
	top: 50%;
	left: 50%;
	transform: translate(-50%, -50%);
	height: 600px;
	width: 800px;
	background: url("../assets/game_images/skyline.png") no-repeat fixed;
	background-size: contain;
	background-position: center;
	background-color: rgb(250, 247, 244);
	display: flex;
	/* justify-content: center;
	align-items: center;
	-webkit-background-size: cover;
	-moz-background-size: cover;
	-o-background-size: cover; */
	/* background-size: 600px, 400px;
	background-color: black; */
}

.pong-game img {
	max-width: 100%;
	max-height: 100%;
}

.start-button-container {
	position: absolute;
	width: 100px;
	height: 30px;
	top: calc(600px);
	left: calc(360px);
 	z-index: 1; /* make sure the button is on top of the canvas */
}
.player1-paddle,
.player2-paddle {
	position: absolute;
	width: 20px;
	height: 100px;
	background-color: rgb(12, 14, 14);
}

.player1-paddle {
	left: 10px;
}

.player2-paddle {
	right: 10px;
}

.ball {
	position: absolute;
	width: 20px;
	height: 20px;
	/* top: calc(300px);
	left: calc(360px); */
	background-color: rgb(64, 36, 3);
}
</style>
