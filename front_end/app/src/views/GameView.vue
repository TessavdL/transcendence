<template>
	<div v-if="game" class="pong-game">
		<div class="start-button-container">
		<button @click="toggleGame">{{ game.gameStarted ? 'Stop' : 'Start' }}</button>
	</div>
	<div class="scoreboard">
		<div class="score-player1">Player 1: <span id="player-1-score">{{ game.player1Score }}</span></div>
		<div class="score-player2">Player 2: <span id="player-2-score">{{ game.player2Score }}</span></div>
	</div>
	<div class="player1-paddle" :style="{ top: game.player1Position + 'px' }"></div>
	<div class="player2-paddle" :style="{ top: game.player2Position + 'px' }"></div>
	<div class="ball" :style="{ top: game.ballPosition.top + 'px', left: game.ballPosition.left + 'px' }"></div>
	</div>
</template>

<script lang="ts">
	import io from 'socket.io-client';
	import type { Game } from '../types/GameType';
import { computed, ref } from 'vue';

	export default {
	data() {
		return {
			game: ref<Game>
		};
	},

	setup() {
		const socket = io('http://localhost:3001/pong-game', { withCredentials: true });
		const game = ref<Game>();
		socket.on('gameData', (gameObject: Game) => {
			game.value = gameObject;
		});
		return { socket, game: computed(() => game.value) };
	},

	mounted() {
		this.socket.on('updategameStatus', (gameStatus) => {
			this.game.player1Position = gameStatus.player1Position;
			this.game.player2Position = gameStatus.player2Position;
			this.game.ballPosition = gameStatus.ballPosition;
			this.game.player1Score = gameStatus.player1Score;
			this.game.player2Score = gameStatus.player2Score;
		});
		this.socket.on('updatePaddlePosition', (position) => {
			this.movePaddle(position);
		});
		// this.socket.on('updateBallPosition', (ballPosition) => {
		// 	this.update(ballPosition);
		// });
		window.addEventListener('keydown', (event) => {
			if (event.key === 'ArrowUp') {
				//this.movePaddle(-25); // move the paddle up by .. pixels
				this.socket.emit('movePaddle', 'up');
			} else if (event.key === 'ArrowDown') {
				//this.movePaddle(25); // move the paddle down by .. pixels
				this.socket.emit('movePaddle', 'down');
			}
		});
	},

	beforeRouteLeave() {
		this.socket.disconnect();
	},

	methods: {

		toggleGame() {
		if (this.game.gameStarted) {
			this.game.gameStarted = false;
		} else {
			this.game.gameStarted = true;
		  this.update(); // call the update method to start the game loop
		}
	},
		movePaddle(position: number) {
		const newPosition = this.game.player1Position + position;
		if (newPosition <= 500 && newPosition >= 0) {
			//this.socket.emit('movePaddle', position);
			this.game.player1Position = newPosition;
		}
		console.log('position player 1:', newPosition);
	},
		update() {
			if (!this.game.gameStarted)
				return;
			const gameStatus = {
				ballPosition: this.game.ballPosition,
				ballVelocity: this.game.ballVelocity,
				player1Position: this.game.player1Position,
				player2Position: this.game.player2Position,
				player1Score: this.game.player1Score,
				player2Score: this.game.player2Score,
				gameStarted: this.game.gameStarted,
			};
		this.socket.emit('ballMovement', gameStatus);
		requestAnimationFrame(this.update);
		// if (!this.game.gameStarted)
		// 	return;
		// const ballPosition = {
		// 	top: this.game.ballPosition.top + this.game.ballVelocity.y,
		// 	left: this.game.ballPosition.left + this.game.ballVelocity.x,
		// };

		// // Check for collision with top or bottom walls
		// if (ballPosition.top <= 0 || ballPosition.top >= (600 - 20)) {
		// 	this.game.ballVelocity.y = -this.game.ballVelocity.y;
		// }
		// // Check for collision with left or right walls
		// if (ballPosition.left <= 0 || ballPosition.left >= (800 - 20)) {
		// 	this.game.ballVelocity.x = -this.game.ballVelocity.x;
		// }
		// // Check for score
		// if (ballPosition.left <= 0 ) {
		// 	this.game.ballPosition = { top: 300, left: 150 };
		// 	this.game.ballVelocity = { x: 5, y: 5 };
		// 	this.game.player2Score++;
		// 	this.game.gameStarted = false;
		// } 
		// else if (ballPosition.left >= 780) {
		// 	this.game.ballPosition = { top: 300, left: 650 };
		// 	this.game.ballVelocity = { x: -5, y: -5 };
		// 	this.game.player1Score++;
		// 	this.game.gameStarted = false;
		// } 
		// else {
		// 	this.game.ballPosition = ballPosition;
		// }
		// // Check for collision with player1 paddle
		// const paddleLeft = 0;
		// const paddleRight = 15;
		// const paddleTop = this.game.player1Position;
		// const paddleBottom = this.game.player1Position + 80;
		// if (ballPosition.left <= paddleRight + 15 && 
		// ballPosition.left >= paddleLeft &&
		// ballPosition.top + 20 >= paddleTop && 
		// ballPosition.top <= paddleBottom) {
		// 	this.game.ballVelocity.x = -this.game.ballVelocity.x;
		// }
		// this.socket.emit('updateBallPosition', ballPosition);
		// console.log('Ball position:', ballPosition);
		// requestAnimationFrame(this.update);
		},
	},
};

</script>

<style>
.pong-game::before {
	content: "";
	position: absolute;
	top: 0;
	bottom: 0;
	left: 50%;
	border-left: 8px solid white;
}
.pong-game {
	position: fixed;
	top: 50%;
	left: 50%;
	transform: translate(-50%, -50%);
	height: 600px;
	width: 800px;
	/* /background: url("../assets/game_images/skyline.png") no-repeat fixed; */
	background-size: contain;
	background-position: center;
	background-color: rgb(13, 12, 11);
	display: flex;
	border-top: 8px solid rgb(249, 248, 248);
	border-bottom: 8px solid rgb(253, 251, 251);
	border-left: 8px solid rgb(253, 251, 251);
	border-right: 8px solid rgb(253, 251, 251);
}
@font-face {
	font-family: "arcadeFont";
	src: url("./src/assets/game_images/ARCADECLASSIC.TTF");
}

.scoreboard {
	display: flex;
	justify-content: space-between;
	align-items: center;
	position: absolute;
	top: 20px;
	left: 20px;
	right: 20px;
}
.score-player1, .score-player2 {
	font-size: 24px;
	font-weight: normal;
	color: rgb(217, 250, 32);
	font-family: "arcadeFont";
}
/* .score-player1 {
	order: 1;
}
.score-player2 {
	order: 3;
} */
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
	width: 15px;
	height: 80px;
	background-color: rgb(231, 220, 208);
}
.player1-paddle {
	left: 20px;
	top: 260px;
}
.player2-paddle {
	right: 20px;
	top: 260px;
}
.ball {
	position: absolute;
	width: 20px;
	height: 20px;
	background-color: rgb(238, 221, 202);
	/* --for round ball --*/
	/* position: absolute;
	width: 15px;
	height: 15px;
	top: 290px;
	left: 390px;
	background-color: white;
	border-radius: 50%; */
}
</style>
